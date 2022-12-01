## Start mongodb server
1. Open a terminal
2. change directory to installation path: ` cd "C:\Program Files\MongoDB\Server\5.0\bin" `
3. Start mongodb server: ` ./mongod --dbpath "C:\Users\jason\coding-projects\iNotes\NoteService\data" `
4. Do not close this terminal

## Populate mongodb database
1. Open another terminal
2. change directory to installation path: ` cd "C:\Program Files\MongoDB\Server\5.0\bin" `
3. Open mongo shell ` ./mongo `
4. create assignment 2 databse: ` use assignment2 `

## Import dataset
1. Open another terminal
2. change directory to installation path: `cd "C:\Program Files\MongoDB\Server\5.0\bin"`
3. Import data list
  * userList: `./mongoimport --jsonArray --db assignment2 --collection userList --file C:\Users\jason\coding-projects\iNotes\userListsData.json`
  * noteList: `./mongoimport --jsonArray --db assignment2 --collection noteList --file C:\Users\jason\coding-projects\iNotes\noteListsData.json`

## Export dataset
1. `./mongoexport --collection=userList --db=assignment2 --out=C:\Users\jason\coding-projects\iNotes\export\test.json`

## Drop collection
1. `db.userList.drop()`

## Show collections
1. `show collections`

## Show all databases
1. `show dbs`