from pymongo.mongo_client import MongoClient
import pymongo,time,json
uri = f"mongodb+srv://aarav:aarav123@cluster0.heyzyje.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(uri)

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
    exit()

class connection:
    def __init__(self,collection) -> None:
        self.collection=collection
    def get(self,key):
        return collection_get(self.collection,key)
    def set(self,key,content):
        return collection_set(self.collection,key,content)
    def delete(self,key):
        return collection_delete(key,self.collection)
    def clear_collection(self):
        return collection_clear_all(self.collection)
    def get_all(self):
        return collection_get_all(self.collection)

def get_conn(database):
    db=client[database.replace(".db","")]
    collection=db["keyval"]
    return connection(collection)

def collection_set(collection,key,val):
    if collection_get(collection,key)==None:
        collection.insert_one({"_id":key,"val":val})
    else:
        collection.update_one({"_id":key},{"$set":{"val":val}})

def collection_get(collection,key):
    res=collection.find_one({"_id":key})
    if res==None:
        return None
    return res["val"]

def collection_get_all(collection):
    collection_find=list(collection.find())
    return collection_find

def collection_clear_all(collection):
    collection.delete_many({})

def collection_delete(key,collection):
    collection.delete_many({"_id":key})