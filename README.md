# Tukui MacOS Client

![Create Alhpa Release](https://github.com/mikeacjones/tukui-electron-client/workflows/Create%20Alhpa%20Release/badge.svg)


This application allows macOS users to install and update addons from https://tukui.org. Built using `yarn create react-app` and bundled into an electron app, which has been properly signed and notarized for distribution.



## Running the code yourself:

### Prereq

You will need `yarn` installed. To install `yarn`, run `brew install yarn`.

To install brew, see [https://brew.sh/](https://brew.sh/)

### Installation

Run `yarn` to install depednecies.

### Running the project

Run `yarn start` for local testing - note that the dock icon will not be bundled until building for release.

### Building .app and .dmg

Run `yarn build` - this will produce the appropriate `.app` and `.dmg` files in the `./dist` directory.