{ pkgs }:
pkgs.mkShell {
  packages = [
    # Runs the API and the React dev server.
    pkgs.nodejs_22
    pkgs.just
    # The server runs `git status` in the zmk-config repo after saving.
    pkgs.git
    pkgs.docker-client
    pkgs.docker-compose
  ];
}
