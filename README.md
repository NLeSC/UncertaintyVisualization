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
3. Start Git bash
4. Type: "git clone https://github.com/NLeSC/UncertaintyVisualization"
5. Type: "cd UncertaintyVisualization"
6. Type: "npm install -g grunt grunt-cli"
7. Type: "npm install"
8. Type: "bower install"
9. Type: "bower update"
10. Type: "grunt serve"
11. (this should happen automatically) Open browser, go to "http://localhost:9000"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------

Prerequisites
------------

1. nodejs, http://nodejs.org/
2. bower, http://bower.io
3. Java Development Kit, https://www.java.com/

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

## Data Format

The data format is as follows. The data file should contain a JSON object that specifies `timeline`. `timeline` contains an arrays of objects, `events`.

```
{
  "timeline": {
    "events": [...]
  }
}
```

The `events` array contains events. An event looks like:

```
{
  "actors": {
    "actor:": [
      "dbp:European_Union",
      "dbp:United_Kingdom",
      "dbp:The_Times",
      "dbp:Government_of_the_United_Kingdom"
    ]
  },
  "climax": 89,
  "event": "ev9",
  "group": "100:[\"sell\"]",
  "groupName": "[\"sell\"]",
  "groupScore": "100",
  "labels": [
    "stop",
    "difficulty",
    "pressure"
  ],
  "mentions": [...],
  "prefLabel": ["stop"],
  "time": "20060620"
}
```

* `actors` are the _participants_.
* `climax` is the _climax score_.
* `event` is the event id.
* `group` is the _group_, which consists of a `groupName` and a `groupScore`, separated by a colon.
* `labels` is an array of words from the source text that refer to the event
* `mentions` is an array of mentions, which are specified below.
* `prefLabel` is the prefered label (currently not used).
* `time` is the date of the event. This must be a complete date in the format YYYYmmdd.

The `mentions` array contains mentions and `perspectives`:

```
{
  "mentions": [{
    "char": ["5665","5673"],
    "snippet": [" Sunday Times, said they were extremely concerned about the UK's difficulties in stopping the EU from introducing measures that continue to erode Britain's competitiveness"],
    "snippet_char": [ 81, 89 ],
    "uri": ["http://www.ft.com/thing/f2bc1380-fa32-11e3-a328-00144feab7de"]
    "perspective": [...]      
}
```

* `char`: character offsets of the original text that refers to the event.
* `snippet`: a snippet of text mentioning the event.
* `snippet_char`: an array denoting the exact position of the event in the snippet text. Used for highlighting.
* `uri` is the link to the source text.
* `perspective`: an array of 0  or more perspectives on the event, as described below.

```
"perspective": [
  {
    "attribution": {
      "belief": "confirm",
      "certainty": "certain",
      "possibility": "likely",
      "sentiment": "positive",
      "when": "future"
    },
    "source": "cite:Chris_Giles"
  },
  {
    "attribution": {
      "belief": "denial",
      "certainty": "uncertain",
      "possibility": "unlikely",
      "sentiment": "negative",
      "when": "past"
    },
    "source": "author:Emily_Cadman"
  }
],
```

* `source`: The perrspective's source. can be either `cite:****` or `author:****` to denote citations and/or article authors.
* `attribution`: an object holding the following values:
* `belief`: Is the source `confirm`ing or in `denial` of the event?.
* `certainty` Is the source `certain` or `uncertain` in the event?.
* `possibility`: Is the source denoting the event as `likely` or `unlikely`?.
* `sentiment`: Is the source `negative`, `neutral` or `positive` about the event?.
* `when`: Is the source talking about the `past`, present(`now`) or `future`?

Examples of data files can be found in `app/data/`.
