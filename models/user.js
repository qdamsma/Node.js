const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;


class User {
    constructor(username, email) {
        this.name = username;
        this.email = email
    }

    save() {
        const db = getDb();
        let dbOp;
        if (this._id){
            dbOp = db.collection('users').updateOne({_id: this._id}, {$set: this});
        } else {
            dbOp = db.collection('users').insertOne(this);
        }
        return dbOp
        .then(result => {

        })
        .catch(err => {
            console.log(err);
        });
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users')
        .find({ _id: new ObjectId(userId) })
        .then(user => {
            return user;
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = User;