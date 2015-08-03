Uncertainty Visualization
=========================

[![Build Status](https://travis-ci.org/NLeSC/UncertaintyVisualization.svg?branch=master)](https://travis-ci.org/NLeSC/UncertaintyVisualization)
[![Code Climate](https://codeclimate.com/github/NLeSC/UncertaintyVisualization/badges/gpa.svg)](https://codeclimate.com/github/NLeSC/UncertaintyVisualization)
[![Test Coverage](https://codeclimate.com/github/NLeSC/UncertaintyVisualization/badges/coverage.svg)](https://codeclimate.com/github/NLeSC/UncertaintyVisualization)
[![Sauce Test Status](https://saucelabs.com/buildstatus/uncertaintyvis)](https://saucelabs.com/u/uncertaintyvis)
[![Dependency Status](https://gemnasium.com/NLeSC/UncertaintyVisualization.svg)](https://gemnasium.com/NLeSC/UncertaintyVisualization)

Getting started (windows, from scratch)
---------------------------------------

1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/ (Make sure add node to PATH option is checked)
  1. Create '$HOME/npm' folder (Where $HOME is c:\Users\<username>\AppData\Roaming).
  2. Open node command prompt and run `npm install -g bower grunt-cli`
3. Install Ruby: http://rubyinstaller.org/ (Make sure add ruby to PATH option is checked)
  1. Open ruby command prompt and run `gem install compass`
4. Start Git bash
5. Type: "git clone https://github.com/NLeSC/UncertaintyVisualization"
6. Type: "cd UncertaintyVisualization"
7. Type: "npm install -g grunt grunt-cli"
8. Type: "npm install"
8. Type: "bower install"
8. Type: "bower update"
9. Type: "grunt serve"
10. Open browser, go to "http://localhost:9000"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------

Prerequisites
------------

1. nodejs, http://nodejs.org/
2. bower, http://bower.io
3. compass, http://compass-style.org
4. Java Development Kit, https://www.java.com/

Installation
------------

### Install nodejs

Follow instructions at joyents github website:
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions

### Install nodejs modules
Install bower and grunt-cli globally
```
sudo npm install -g bower grunt-cli
```

### Install compass

Compass is used to convert the sass 2 css.

1. Install Ruby using https://www.ruby-lang.org/en/documentation/installation/#apt
2. Install Ruby dev and other dependecy packages
```
sudo apt-get install ruby-dev libffi-dev
```
3. Install compass (for sass compilation)
```
gem install compass
```

### Fetch git repository
```
git clone https://github.com/NLeSC/UncertaintyVisualization.git
```

### setup with bower
```
cd UncertaintyVisualization
npm install
bower install
```
If you already have a installed the bower packages before, but need to update them for a new version of the code, run
```
bower update
```

### start development server & open browser
```
grunt serve
```
Changes made to code will automatically reload web page.

### Run unit tests

```
grunt test
```
Generates test report and coverage inside `test/reports` folder.

### Run end-to-end tests with local browser (chrome)

Tests in Chrome can be run with
```
grunt e2e-local
```

### Run end-to-end tests on [sauce labs](https://saucelabs.com/)

To connnect to Sauce Labs use sauce connect program. [Here](https://docs.saucelabs.com/reference/sauce-connect/) you can find the details on how to install and run it.

Before tests can be run the sauce labs credentials must be setup

```
export SAUCE_USERNAME=<your sauce labs username>
export SAUCE_ACCESS_KEY=<your sauce labs access key>
```

Tests in Chrome, Firefox on Windows, Linux and OSX can be run with
```
grunt e2e-sauce
```

Travis-ci also runs end-to-end tests on sauce labs.

Note! Running `grunt e2e-sauce` will undo all changes in `app/` folder.

### Build a distro

```
grunt build
```
The `dist` folder has production ready distribution.

### Generate API documentation

```
grunt jsdoc
```

API documentation is generated in `doc/` directory.
