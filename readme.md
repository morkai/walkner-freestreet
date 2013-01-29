# FreeStreet Tester

## Requirements

### node.js

Node.js is a server side software system designed for writing scalable
Internet applications in JavaScript.

  * __Version__: 0.6.x
  * __Website__: http://nodejs.org/
  * __Download__: http://nodejs.org/download/
  * __Installation guide__: https://github.com/joyent/node/wiki/Installation

### MongoDB

MongoDB is a scalable, high-performance, open source NoSQL database.

  * __Version__: 2.x.x
  * __Website__: http://mongodb.org/
  * __Download__: http://www.mongodb.org/downloads
  * __Installation guide__: http://www.mongodb.org/display/DOCS/Quickstart

### MODBUS TCP/IP slave

Download a simulator: http://www.plcsimulator.org/

## Installation

Clone the repository:

```
git clone git://github.com/morkai/walkner-freestreet.git
```

or [download](https://github.com/morkai/walkner-freestreet/zipball/master)
and extract it.

Go to the project's directory and install the dependencies:

```
cd walkner-freestreet/
npm install
```

## Configuration

By default, the application connects to MongoDB on `127.0.0.1:27017`.
If you want to change these values, you can find them in the `app/boot/db.js` file.

By default, the HTTP server listens on port `82`. If you want to change that value,
you can find it in the `app/boot/express.js` file.

The `app/config/testers.js` file contains the mappings of the I/O registers
for different MODBUS TCP/IP slaves.

## Start

If not yet running, start the MongoDB.

Start the application server in `development` or `production` environment:

  * under *nix:

    ```
    NODE_ENV=development node walkner-freestreet/app/server.js
    ```

  * under Windows:

    ```
    SET NODE_ENV=development
    node walkner-freestreet/app/server.js
    ```

Application should be available on a port defined in `app/boot/express.js` file
(`82` by default). Point the Internet browser to http://127.0.0.1:82/
and log in using `walkner@walkner.pl`/`Walkner1`.

## License

This project is released under the
[CC BY-NC 3.0](https://raw.github.com/morkai/walkner-isa/master/license.md).
