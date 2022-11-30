# Team017 Final Project

## DESCRIPTION
The goal of our project is to provide a novel data visualization tool for movie recommendation. Traditionally, movie recommendation is done using collaborative filtering in which movies are recommended based on what other similar users watch. Our approach deviates from this by providing information on the content-based similarity of various movies, utilizing attributes such as popularity and budget. We expect this tool to be valuable as it allows users to maintain privacy over what movies they have watched and provides less biased results. 

We aim to create a movie recommendation tool with visualizations of relative similarities between movies. In this visualization tool, we will show the relative similarities of the movie content per genre. In addition, for a given movie, we provide visualizations of the most similar movies. 

We have a variety of key innovations in our project. Our first key innovation is that we use PCA to map features associated with the movie, as opposed to user-movie relationships, to a smaller latent embedding that is then used downstream for both movie clustering and movie recommendation. Then we perform K Means clustering on the latent embeddings stratified according to genre of movie to obtain a genre-specific grouping of movies that can be explored. We use UMAP as a rich visualization tool for the feature embeddings representing the groupings of movies along genre. We also provide a tool for movie recommendation that uses KNN to predict the top ten most aligned movies based on the obtained PCA embedding. These are validated by showing the rating on aggregate of all the movies relative to actual rating of the searched movie. Our novel approach uses a combination of these four tools.

## DATA ANALYSIS INSTRUCTIONS
The raw data is located in the data_raw folder

To preprocess the data, run the notebook `Data_Scraping.ipynb`

To obtain the PCA embeddings, the KNN recommendations, and the K Means clustering, run the notebook  `PCA_Embeddings_KNN_KMeans.ipynb`

## INSTALLATION
To run the data preprocessing and analysis scripts, the requirements include:
- sklearn
- pandas
- numpy
- seaborn
- matplotlib
These work for any version of python >= 3.6.

To run and use the visualization, the only requirement is Python. The other dependencies are self-contained in this package.

## VISUALIZATION EXECUTION

Navigate to the main directory of the project and run the following command in the terminal to set up a server:

`python3 -m http.server 8000`

If you are using Python2, use the command 
`python -m SimpleHTTPServer`

Open an internet explorer like Google Chrome and go to the localhost link that is provided from running the above command: http://[::]:8000/

## WRITEN DEMO

Clusters are generated based on the genre on the top left under the Move Explorer title you can click on the current genre which should be action and change the genre. Additionally, you can hover over a node on the cluster which provides a bar graph in increasing order of distances of the ten closest movies to the movie that is selected. The movie that is selected is shown as the title of the bar chart with the year it was released in paratheses. Furthermore the IMDB rating is provided under the title of the movie.
