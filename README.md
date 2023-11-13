## LahainaSim
Current status of LahainaSim [![ci-lahaina-sim](https://github.com/HACC2023/VENGEN/actions/workflows/ci.yml/badge.svg)](https://github.com/HACC2023/VENGEN/actions/workflows/ci.yml)

Lahaina Sim is an interactive web application designed to foster creativity and community engagement in the aftermath of the devastating wildfires that swept through Lahaina. Users are invited to participate in the reconstruction efforts by uploading their own 3D models, enabling them to simulate and visualize potential rebuilding scenarios. Users can enhance their uploaded models by pairing them with personally uploaded inspiration images or custom generated inspiration images directly within the app, utilizing the DALLE-2 integration. This platform serves as a virtual canvas where individuals can share and exchange ideas, sparking collaborative discussions about the future architectural landscape of Lahaina. Whether it's proposing innovative designs or discussing the intricacies of simulations, Lahaina Sim provides a space for collective brainstorming and envisioning a resilient and vibrant future for the city.

In addition to its simulation capabilities, Lahaina Sim offers a comprehensive insight into the demographic and visitor statistics of Maui County. Users can access valuable data that provides a deeper understanding of the community, helping to inform decision-making processes during the rebuilding phase. By integrating these statistical features, Lahaina Sim not only acts as a creative hub for architectural ideation but also as a repository of information that empowers users with a holistic view of the region. Through this dual functionality, Lahaina Sim emerges as a dynamic platform where innovation, community engagement, and data-driven decision-making converge to shape the restoration and revitalization of Lahaina.

## How to use LahainaSim

### Deployed Version
To visit the deployed application, visit the website using any web browser. 

#### User Instructions
1. Sign in/Sign up
   - Create an account or log into an existing one
2. Upload models
   - Navigate to the New Model page
   - Select a 3D model from local files and upload it
   - Upload any inspirations photos or generate custom ones with text prompts to DALLE-2
   - Fill in the name and estimate cost to build the model
3. Create Simulations
   - Navigate to the Simulation page
   - Select models to place on the map, adjust as desired
   - Upload the simulation to the Gallery
4. Explore the Gallery
   -  Navigate to the Gallery page
   -  Click on any model or simulation to view
5. Engage in Discussions
   - Navigate to the Discussions page
   - Share any thoughts, ideas, or feedback about the model or simulation
   - Create a new thread to engage in discussions outside of a model or simulation
6. View Statistics
   - Navigate to the Statistics page
   - Click on any of the counties to view demographic statistics
   - Click on visitor statistics for statewide visitor statistics

### Source Code
For developers to run the local version of this application, they will need to have Node.js and Meteor installed. They will also need to get the following API keys: Amazon S3, OpenAI, Mapbox, and Google. 

1. Clone the repository to your local computer.
2. Change directory (``cd``) into the app/ directory, and install third party libraries with: ```meteor npm install```
Make a copy the settings.development.json file from config/ directory, and rename it to settings.production.json in the same directory.
3. Place your API keys under their corresponding section titles, under a property called "apiKey".
   - For example, the OpenAI API key would be formatted as: "openai": { "apiKey": .... }
   - Ensure the the Amazon S3 API key has the following properties: key, secret, bucket, and region.
4. In your terminal, change directory (cd) into the app/ directory and run the command: ```meteor npm run start```
5. Open http://localhost:3000 to view the running local application.

### Important Links
- GitHub Repository: https://github.com/HACC2023/VENGEN/tree/main
- Deployed Application: https://lahainasim.xyz/
- Functional Evaluation Video: https://drive.google.com/file/d/1lE9r0g4pT7k2FOtk-q7PMih9YWjAVFag/view?usp=sharing

Template Details: http://ics-software-engineering.github.io/meteor-application-template-react/
