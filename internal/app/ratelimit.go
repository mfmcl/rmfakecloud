package app

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// ipStore tracks per-IP rate limiters with periodic cleanup.
type ipStore struct {
	mu       sync.RWMutex
	limiters map[string]*clientEntry
	r        rate.Limit
	b        int
}

type clientEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPStore(r rate.Limit, b int) *ipStore {
	s := &ipStore{
		limiters: make(map[string]*clientEntry),
		r:        r,
		b:        b,
	}
	go s.reap(10 * time.Minute)
	return s
}

func (s *ipStore) take(ip string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	e, ok := s.limiters[ip]
	if !ok {
		e = &clientEntry{limiter: rate.NewLimiter(s.r, s.b)}
		s.limiters[ip] = e
	}
	e.lastSeen = time.Now()
	return e.limiter.Allow()
}

func (s *ipStore) reap(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		s.mu.Lock()
		cutoff := time.Now().Add(-interval)
		for ip, e := range s.limiters {
			if e.lastSeen.Before(cutoff) {
				delete(s.limiters, ip)
			}
		}
		s.mu.Unlock()
	}
}

// clientIP extracts the real client IP, respecting X-Forwarded-For from nginx.
func clientIP(c *gin.Context) string {
	if fwd := c.GetHeader("X-Forwarded-For"); fwd != "" {
		if i := strings.IndexByte(fwd, ','); i != -1 {
			return strings.TrimSpace(fwd[:i])
		}
		return fwd
	}
	if real := c.GetHeader("X-Real-IP"); real != "" {
		return real
	}
	ip, _, _ := net.SplitHostPort(c.Request.RemoteAddr)
	return ip
}

var (
	// 10 requests per minute, burst of 5 — for login/register
	strictStore = newIPStore(rate.Limit(10.0/60.0), 5)

	// 300 requests per minute, burst of 100 — for everything else
	generalStore = newIPStore(rate.Limit(300.0/60.0), 100)
)

// rateLimitMiddleware applies per-IP rate limiting.
// Login and register endpoints get a strict limit; all other paths get a
// generous limit suitable for sync traffic.
func rateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		ip := clientIP(c)

		var allowed bool
		if path == "/ui/api/login" || path == "/ui/api/register" {
			allowed = strictStore.take(ip)
		} else {
			allowed = generalStore.take(ip)
		}

		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}
