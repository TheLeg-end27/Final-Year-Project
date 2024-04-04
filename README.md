# Offline HTML5 Maps Application

This repository is an application that allows users to leave location-based messages offline, which are be available for other users to see once the user connects to the internet.

## Repository Structure
- `__tests__/`: Jest unit tests for the JavaScript code.
- `django_tests/`: Unit tests for the Django backend.
- `selenium_tests/`: Selenium unit tests for user interaction.
- `static/myapp/`: Contains the JavaScript code.
- `templates/`: Contains the HTML code.
- `map/map/`: Contains the above folders as well as Django views, models, URLs, and dynamoDB integration.
- `Documents`: All reports in PDF.

## Installation and Setup
- First, install the needed packages from the requirements.txt file.
    ```
    pip install -r requirements.txt
    ```
- Create the database migration files based on the model definitions.
    ```
    python manage.py makemigrations
    ```
- We then need to create the database using the migration files.
    ```
    python manage.py migrate
    ```
- To create a moderator user:
    ``` 
    python manage.py createsuperuser
    ```
- To access the AWS services that the application uses, use the AWS CLI
    ```
    aws configure
    ```
- You will be prompted to enter the AWS access keys. The following keys will be valid temporarily:
    ```
    Access key: AKIA6Q5DIMO6VNWOHF64
    AWS Secret key: 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
    ``` 
    Additionally, set the default region name and output format to eu-west-2 and json.
    To run the application: 
    ```
    python manage.py runserver
    ```
## Interim deliverables
- Offline "Hello World" page using Service Workers and Cache
- Application to draw shapes using HTML5 canvas
- Web page that loads and list raw OSM data
- “to do list” application with IndexedDB

## Final deliverables
- Offline map application using Leaflet.js
- Messaging functionality
- Automated content moderation: using a keyword list and language model (AWS Comprehend)
- Human moderation

**Interim video demonstration:** https://youtu.be/MX8nTSGTuZI
**Final video demonstration:** https://www.youtube.com/watch?v=Czbw1-bSpYQ