package models

import (
	"bytes"
	"io"
	"testing"

	"github.com/ddvk/rmfakecloud/internal/storage"
)

type fakeRemoteStorage struct {
	blobs map[string][]byte
}

func (f *fakeRemoteStorage) GetRootIndex() (string, int64, error) { return "", 0, nil }

func (f *fakeRemoteStorage) GetReader(hash string) (io.ReadCloser, error) {
	b, ok := f.blobs[hash]
	if !ok {
		return nil, io.ErrUnexpectedEOF
	}
	return io.NopCloser(bytes.NewReader(b)), nil
}

// Newer firmware encodes pageTags as objects ({"name": ..., "timestamp": ...}),
// while rmapi's archive.Content expects []string. Decoding the .content blob
// into that struct used to fail, surfacing as a 500 on PDF export.
func TestArchiveFromHashDocToleratesObjectPageTags(t *testing.T) {
	content := `{
		"fileType": "",
		"pageCount": 1,
		"pages": ["page-1"],
		"pageTags": [{"name": "todo", "timestamp": "2026-10-12T17:00:00Z"}]
	}`
	rs := &fakeRemoteStorage{blobs: map[string][]byte{"content-hash": []byte(content)}}
	doc := &HashDoc{
		HashEntry: HashEntry{EntryName: "doc-1"},
		Files: []*HashEntry{
			{Hash: "content-hash", EntryName: "doc-1" + storage.ContentFileExt},
		},
	}

	a, err := ArchiveFromHashDoc(doc, rs)
	if err != nil {
		t.Fatalf("ArchiveFromHashDoc() error = %v", err)
	}
	if len(a.Content.Pages) != 1 || a.Content.Pages[0] != "page-1" {
		t.Fatalf("pages = %v, want [page-1]", a.Content.Pages)
	}
}
