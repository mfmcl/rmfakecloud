{
  description = "rmfakecloud — custom fork with improved UI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
      ];
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.callPackage ./nix/package.nix {
            src = self;
          };
          rmfakecloud = pkgs.callPackage ./nix/package.nix {
            src = self;
          };
        }
      );

      # Overlay so you can just do: overlays = [ rmfakecloud.overlays.default ];
      overlays.default = final: prev: {
        rmfakecloud = final.callPackage ./nix/package.nix {
          src = self;
          nixosTests = prev.nixosTests;
        };
      };
    };
}
