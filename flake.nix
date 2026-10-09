{
  description = "RHUL Club Penguin devshell config";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_24
          pnpm_11
        ];
        shellHook = ''
          echo "Node $(node --version) / PNPM $(pnpm --version)"
        '';
      };
    };
}
