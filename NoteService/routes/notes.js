var express = require('express');
const monk = require('monk');
var router = express.Router();


function createDatebaseTimestemp(dateObj) {
    let dateString = dateObj.toString();
    let arr = dateString.split(" ");
    let slicedArr = arr.slice(0,5)
    const weekday = slicedArr[0];
    const month = slicedArr[1];
    const day = slicedArr[2];
    const year = slicedArr[3];
    const time = slicedArr[4];
    let dbTimestamp = time + " " + weekday + " " + month + " " + day + " " + year;
    return dbTimestamp;
}


router.post('/signin', (req, res)=> {
    const name = req.body.name;
    const password = req.body.password;
    let userListCol = req.db.get('userList');
    let noteListCol = req.db.get('noteList');
    let responseData = {
        error: "",
        username: "",
        icon:"",
        notes:[] 
    };

    userListCol.findOne({name: name, password: password}).then((currentUser) => {
        if (!currentUser) {
            throw new Error('Login failure');
        }
        
        req.session.userId = currentUser._id;

        responseData.username = currentUser.name;
        responseData.icon = currentUser.icon;
        return noteListCol.find({userId: currentUser._id});
    }).then((userNotes) => {
        if (!userNotes) {
            throw new Error("Error in retrieving Notes")
        }
        userNotes.forEach(element => {
            // object destructuring - remove userId and content property from note object
            const {userId, content, ...note} = element; 
            responseData.notes.push(note);

        });
        res.json(responseData);
    }).catch(err=> {
        responseData.error = err.toString();
        res.send(responseData);
    });

});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.send("");
});

router.get('/getnote', (req, res) => {
    const noteid = req.query.noteid;
    let noteListCol = req.db.get('noteList');
    let responseData = {
        error: "",
        note: ""
    };

    // get all notes if noteid === "0"
    if (noteid === "0") { 
        noteListCol.find({userId: monk.id(req.session.userId)}).then((allNotes) => {
            responseData.note = allNotes;
            res.json(responseData);
        }).catch((err) => {
            responseData.error = err.toString();
            res.json(responseData);
        }); 
    } 

    else {
        noteListCol.find({_id: monk.id(noteid)}).then((note) => {
            if (!note) {
                throw new Error("Error in retrieving note");
            }
            responseData.note = note;
            res.json(responseData);
        }).catch(err => {
            responseData.error = err.toString();
            res.json(responseData);
        });

    }
});

router.post('/addnote', (req,res) => {
    const noteTitle = req.body.title;
    const noteContent = req.body.content;
    const userId = req.session.userId;
    const timestamp = createDatebaseTimestemp(new Date());
    let noteDocument = {
        lastsavedtime: timestamp,
        title: noteTitle,
        content: noteContent,
        userId: monk.id(userId)
    };
    let responseData = {
        error: "",
        lastsavedtime: timestamp,
        inserted_note_id: "",
    };
    let noteListCol = req.db.get('noteList');
    noteListCol.insert(noteDocument).then((result) => {
        responseData.inserted_note_id = result._id;
        res.json(responseData);

    }).catch(err => {
        responseData.error = err.toString();
        res.json(responseData)
    });
});


router.put('/savenote/:noteid', (req, res) => {
    const noteid = req.params.noteid;
    const newContent = req.body.content;
    const newTitle = req.body.title;
    const newTimestamp = createDatebaseTimestemp(new Date());
    let noteListCol = req.db.get('noteList')
    let updateQuery = {
        title: newTitle,
        content: newContent,
        lastsavedtime: newTimestamp
    };
    responseData = {
        success: "",
        error: "",
    };
    noteListCol.update({_id: monk.id(noteid)}, {$set: updateQuery})
    .then(() => {
        responseData.success = newTimestamp;
        res.json(responseData);
    }).catch(err => {
        responseData.error = err.toString();
        res.json(responseData);
    })
});

router.get('/searchnotes', async (req, res) => {
    let searchStr = req.query.searchstr;
    let noteListCol = req.db.get('noteList');
    const userId = req.session.userId;
    let responseData = {
        error: "",
        matchedNotes: [],
    }
    
    let dbResult = [];
    // suspend the function until noteListCol.find() func finish executing
    dbResult= await noteListCol.find({userId: monk.id(userId)}).then((documents) => {
        let filtered = documents.filter((el) => {
            return el.content.includes(searchStr) || el.title.includes(searchStr);
        });
        return filtered
    }).catch(err => {
        responseData.error = err.toString();
    });

    
    if (responseData.error) {
        res.json(responseData)
    } else {
        
        dbResult.forEach(element => {
            // object destructuring - remove userId and content property from note object
            const {userId, content, ...note} = element;
            responseData.matchedNotes.push(note);
        })
        res.json(responseData)
    }


});

router.delete('/deletenote/:noteid', (req, res) => {
    const noteid = req.params.noteid;
    let noteListCol = req.db.get('noteList');

    noteListCol.remove({_id: noteid}).then(() => {
        responseData.success = "Deleted successfully";
        res.send("");
    }).catch(err => {
        res.json({error: err.toString()});
    });
})

module.exports = router;  