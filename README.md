Link to app in production: [https://www.epa.gov/egrid/data-explorer](https://www.epa.gov/egrid/data-explorer)

# **eGRID Data Explorer**

This interactive data explorer for eGRID enables the visual exploration of hundreds of unique combinations of eGRID data points. Data can be sorted by fuel type (including fossil fuels and renewable energy such as wind, solar, and hydro), emission type, and region. This project relies on front-end JavaScript in order to be deployed onto the EPA&#39;s Drupal WebCMS.

**Installation**

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

1. `git clone` the application to your local machine.
2. Navigate to the root of the project and run `npm install`.
3. After downloading the required packages, you can run `npm start`. In your browser, go to [http://localhost:2629](http://localhost:2629/).


**Requirements**

- [Node.js and npm](https://nodejs.org/en/)

**Deployment**

To deploy the app onto either the [production EPA Drupal site](https://wcms.epa.gov/) or the [staging app dev server](https://webcms.appdev.epa.gov/), build the app for production by running `npm run build`, then copy the contents of `build` folder to Drupal or the staging app dev server.

**Built With**

- [Node.js and npm](https://nodejs.org/en/) - JavaScript runtime and package manager
- [ReactJS](https://reactjs.org/) - The JavaScript framework
- [D3 Data-Driven Documents](https://d3js.org/) - JavaScript library for data visualization

**Versioning**

- Version 1.0 was released on September 21, 2020.

**Helpful Links**

- [Production site](https://www.epa.gov/egrid/data-explorer)
- [eGRID Home page](https://www.epa.gov/egrid)

**Disclaimer**

The United States Environmental Protection Agency (EPA) GitHub project code is provided on an &quot;as is&quot; basis and the user assumes responsibility for its use. EPA has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by EPA. The EPA seal and logo shall not be used in any manner to imply endorsement of any commercial product or activity by EPA or the United States Government.