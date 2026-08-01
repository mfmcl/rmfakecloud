{
  lib,
  buildGoModule,
  enableWebui ? true,
  pnpm_11,
  fetchPnpmDeps,
  pnpmConfigHook,
  nodejs,
  nixosTests ? null,
  src,
}:
let
  uiSrc = src + "/ui";
in
buildGoModule rec {
  pname = "rmfakecloud";
  version = "0.0.31-custom";

  inherit src;

  vendorHash = "sha256-A+y63w+sEleXFh4ZHgFo1IhsQ2KhqqKW4vRPi393atI=";

  # if using webUI build it
  env.pnpmRoot = "ui";
  env.pnpmDeps = fetchPnpmDeps {
    inherit pname version;
    src = uiSrc;
    pnpm = pnpm_11;
    fetcherVersion = 4;
    hash = "sha256-m++AoqNkD0pRB4OdSs80s9mHz76xUiI0tH+V9exd1IY=";
  };

  preBuild = lib.optionals enableWebui ''
    # avoid re-running pnpm i...
    touch ui/pnpm-lock.yaml

    make ui/dist
  '';

  nativeBuildInputs = lib.optionals enableWebui [
    nodejs
    pnpmConfigHook
    pnpm_11
  ];

  # ... or don't embed it in the server
  postPatch = lib.optionals (!enableWebui) ''
    sed -i '/go:/d' ui/assets.go
  '';

  ldflags = [
    "-s"
    "-w"
    "-X main.version=v${version}"
  ];

  passthru.tests = lib.optionalAttrs (nixosTests != null) {
    rmfakecloud = nixosTests.rmfakecloud;
  };

  meta = {
    description = "Host your own cloud for the Remarkable (custom fork)";
    homepage = "https://ddvk.github.io/rmfakecloud/";
    license = lib.licenses.agpl3Only;
    maintainers = with lib.maintainers; [ martinetd ];
    mainProgram = "rmfakecloud";
  };
}
