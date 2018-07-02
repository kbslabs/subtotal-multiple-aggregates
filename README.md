# Subtotal with Multiple Aggregates

This is a JavaScript plugin for [PivotTable.js](https://pivottable.js.org/examples/). It renders rows and columns of a pivot table with subtotals and lets the user expand or collapse rows and columns. It has been forked from [Subtotal.js](http://nagarajanchinnasamy.com/subtotal) to provide support for multiple aggregates.

This plugin has been designed for use with the [Looker Custom Visualization API](https://github.com/looker/visualization-api-examples) and includes Looker-specific styles and themes. See that repository for details.

## Making changes

1. Install [NodeJS](https://nodejs.org/en/)
1. Install the [Yarn package manager](https://yarnpkg.com/lang/en/)
1. `git clone` this repo
1. Run `yarn` to install dependencies
1. Run `yarn build` to rebuild the files in `dist/`.
   1. Or, optionally, if you're making frequent changes, run `yarn watch` to monitor the source files and rebuild as soon as you change anything.)

## Building the Looker Visualization

As this plugin is meant to be used as a [Looker custom visualization](https://github.com/looker/custom_visualizations_v2), you'll want to build the full Looker custom viz plugin as well.

After you've done the above:

1. `cd` to this directory
1. Run `yarn link`
1. `git clone https://github.com/looker/custom_visualizations_v2` and `cd` to that directory
1. Run `yarn` to install dependencies
1. Run `yarn link subtotal-multiple-aggregates`
1. Run `yarn build` to build the Looker custom viz plugins in `custom_visualizations_v2/dist/`
1. Either copy `custom_visualizations_v2/dist/subtotal.js` to your Looker instance or serve it using a service like [ngrok](https://ngrok.com/).
