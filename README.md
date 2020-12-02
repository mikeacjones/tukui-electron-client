# Tukui macOS Client

![Create Alhpa Release](https://github.com/mikeacjones/tukui-electron-client/workflows/Create%20Alhpa%20Release/badge.svg)


This application allows macOS users to install and update addons from https://tukui.org. Built using `yarn create react-app` and bundled into an electron app; properly signed and notarized for distribution without needing to bypass macOS security.



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

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate (if I've added tests by the time you are reading this).

I am not a macOS developer, nor am I a developer who has ever used react before this. Feel free to point out any places where my code is shit :)

## License
[MIT](https://choosealicense.com/licenses/mit/)