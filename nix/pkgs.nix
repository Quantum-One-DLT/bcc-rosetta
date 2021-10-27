{ sources ? import ./sources.nix }:

let
  tbcoNix = import sources.tbco-nix {};
  overlay = self: super: {
    packages = self.callPackages ./packages.nix { };
  };
in
  import tbcoNix.nixpkgs { overlays = [ overlay ]; config = {}; }
