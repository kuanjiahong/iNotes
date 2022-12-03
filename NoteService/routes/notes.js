const { response } = require('express');
var express = require('express');
const monk = require('monk');
var router = express.Router();


router.get('/load', (req, res) => {
    console.log(req.session);
    if (req.session.userId) {
        let userListCol = req.db.get('userList');
        let noteListCol = req.db.get('noteList');
        let responseData = {
            error: "",
            user: "", 
            notes: ""
        };
        userListCol.findOne({_id: monk.id(req.session.userId)}).then((currentUser) => {
            if (!currentUser) {
                throw new Error('Login failure');
            }
            
            // res.cookie('userId', currentUser._id, {maxAge: 30 * 60000});
            req.session.userId = currentUser._id;
    
            console.log(req.session)
        
            responseData.user = currentUser;
            return noteListCol.find({userId: monk.id(req.session.userId)});
        }).then((userNotes) => {
            if (!userNotes) {
                throw new Error("Error in retrieving Notes")
            }
    
            responseData.notes = userNotes;
    
            res.json(responseData);
        }).catch(err=> {
            responseData.error = err;
            res.send(responseData);
        });
    } else {
        res.send("Nothing")
    }
})

router.post('/signin', (req, res)=> {
    const name = req.body.name;
    const password = req.body.password;
    let userListCol = req.db.get('userList');
    let noteListCol = req.db.get('noteList');
    let responseData = {
        error: "",
        user: "", 
        notes: ""
    };
    userListCol.findOne({name: name, password: password}).then((currentUser) => {
        if (!currentUser) {
            throw new Error('Login failure');
        }
        
        // res.cookie('userId', currentUser._id, {maxAge: 30 * 60000});
        req.session.userId = currentUser._id;

        console.log(req.session)
    
        responseData.user = currentUser;
        return noteListCol.find({userId: currentUser._id});
    }).then((userNotes) => {
        if (!userNotes) {
            throw new Error("Error in retrieving Notes")
        }

        responseData.notes = userNotes;

        res.json(responseData);
    }).catch(err=> {
        responseData.error = err;
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
        usernotes: ""
    };
    noteListCol.find({_id: noteid}).then((note) => {
        if (!note) {
            throw new Error("Error in retrieving note");
        }
        responseData.usernotes = note;
    }).catch(err => {
        responseData.error = err;
        res.json(responseData);
    });
});

router.post('/addnote', (req,res) => {
    const noteTitle = req.body.title;
    const noteContent = req.body.content;
    const userId = req.cookies.userId;
    const timestamp = new Date.now();
    let noteDocument = {
        lastsavedtime: timestamp,
        title: noteTitle,
        content: noteContent,
        userId: userId
    };
    let responseData = {
        error: "",
        lastsavedtime: timestamp,
        inserted_note_id: "",
    };
    let noteListCol = req.db.get('noteList');
    noteListCol.insert(noteDocument).then((result) => {
        console.log("Newly inserted _id is: ", result._id);
        responseData.inserted_note_id = result._id;
        res.json(responseData);

    }).catch(err => {
        responseData.error = err
        res.json(responseData)
    });
});


router.put('/savenote/:noteid', (req, res) => {
    const noteid = req.params.noteid;
    const newContent = req.body.content;
    const newTitle = req.body.title;
    const newTimestamp = new Date().now()
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
    noteListCol.update({_id: noteid}, {$set: updateQuery})
    .then((result) => {
        console.log(result);
        responseData.success = newTimestamp;
        res.json(responseData);
    }).catch(err => {
        responseData.error = err;
        res.json(responseData);
    })
});

router.get('/searchnotes', (req, res) => {
    let searchStr = req.query.searchstr;
    let noteListCol = req.db.get('noteList');
    const userId = req.cookies.userId;
    let responseData = {
        error: "",
        result: "",
    }
    noteListCol.find({userId: userId}).then((documents) => {
        let filtered = documents.filter((el) => {
            return el.name.includes(searchStr) || el.title.includes(searchStr);
        });
        
        responseData.result = filtered;
        res.json(responseData);
    }).catch(err => {
        responseData.error = err;
        res.json(err);
    });

});

router.delete('/deletenote/:noteid', (req, res) => {
    const noteid = req.params.noteid;
    let noteListCol = req.db.get('noteList');

    noteListCol.remove({_id: noteid}).then(() => {
        responseData.success = "Deleted successfully";
        res.send("");
    }).catch(err => {
        res.json({error: err});
    });
})

module.exports = router;  