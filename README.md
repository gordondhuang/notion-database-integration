# Notion-Integration
This project was created to aid students in organizing their course information to optimize productivity. Ideally the user has no pre-existing database already set up.
It currently only works jointly with my other project [Canvas-fetcher](https://github.com/gordondhuang/Canvas-fetcher). 

## Usage
To function correctly **input.txt** must be modified.

1. The first line should be the Notion API key that was generated
2. The second line should be a slice of the URL link to your database in Notion
3. Use these sequences of commands in the terminal with the folder of the project open as the directory: 

    ```bash
    node setup.js
    
    node notion.js
    
    ```

**WIP!!!**  

## Potential Issues

Must have the API key and URL link in that specific order, if you do not you may 
have to go into the .env file to change the API key and API database variables.

The course should also have the same course abbreviations 
e.g. CSE 121 in the database and CSE 121 somewhere in the name of the Canvas course

## Notion API Token key generation



## Documentation
- [Notion API](https://developers.notion.com/docs/getting-started)
- [UW Canvas Policies](https://itconnect.uw.edu/tools-services-support/teaching-learning/canvas/canvas-policies/)
