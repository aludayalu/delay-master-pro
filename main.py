import litedb,flask,json,datetime,requests
from flask import Flask,request
users=litedb.get_conn("users")
app=Flask(__name__)

presentation=False

from revChatGPT.V1 import Chatbot
chatbot = Chatbot(config={
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJrcml0YXJ0aHNoYW5rckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vYXV0aCI6eyJ1c2VyX2lkIjoidXNlci1LclFiNjdQa00yNk5HS2dLRTJmUkRQbVkifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE2MDY2MzU2ODQxNjM2OTE5ODQ1IiwiYXVkIjpbImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEiLCJodHRwczovL29wZW5haS5vcGVuYWkuYXV0aDBhcHAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY5MzExMjY2MCwiZXhwIjoxNjk0MzIyMjYwLCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUgbW9kZWwucmVhZCBtb2RlbC5yZXF1ZXN0IG9yZ2FuaXphdGlvbi5yZWFkIG9yZ2FuaXphdGlvbi53cml0ZSBvZmZsaW5lX2FjY2VzcyJ9.ld_Fx5Us2_duCbZXBy1sfifJ2kkAsmPGdo3l5DHC2IJtrHNFkhn1BHgMDfVGQEGqWFMYTYTsbZu-_9M8dzFtP7RagQ5JOGrxIrJZ5XmlPPg6oD2RwU2PlgQpR-G7M3Fok1GFrH0R19ru7Vd9P84AzuSSQrlRMHgANHMNBj8ozSFDqJxOvq1lEdmwfOzIJzVfRRQnnh0NWUMVKcmhHLCUHR9sbuaBbgKYv5xAXLRaceuYNJyLy_MTCtRlEsUJvphpbcof3ye7j7Wd7yR01NIqQj-EMugBy5SDSd8hIjiT2nEC2mB5H8CHmW6FiCuxye9TPeQb916OFMH00cODJDeVqg"
})

question_=f"""
Hey Bard! I am giving you this data inputted by a user. The user has inputted details of a reminder (we call it guilty crime).
Also assume that todays date is {str(datetime.datetime.now())} just in case the user says a time with todays reference."""+"""
Here is the input by the user
```
{question here}
``` user input ends here
Return me data in pure json with the three keys crime, reminder_text. The crime must not be more than 100 chars.
Dont return me anything at all except raw json data in plain text without markup (your results will be parsed as json so please just give me back a dictionary)
"""

def get_query(question):
    response=""
    for x in chatbot.ask(question_.replace("{question here}",question)):
        response=x["message"]
    return response


def make_response(data):
    if type(data)!=str:
        data=json.dumps(data)
    resp=flask.Response(data)
    resp.headers["Access-Control-Allow-Origin"]="*"
    resp.headers["Content-Type"]="application/json"
    return resp

@app.get("/details")
def details():
    args=dict(request.args)
    res=users.get(args["email"])
    if res==None:
        new_details={"email":args["email"],"tasks":[]}
        users.set(args["email"],new_details)
        return make_response(new_details)
    else:
        return make_response(res)

@app.get("/question")
def question():
    args=dict(request.args)
    return make_response(get_query(args["question"]))

def avatar():
    serverUrl = 'http://20.84.94.16:9090/api/generate_avatar';
    requestData = {
        "token": "X2qHYAoUpqEE1yf2XE0ez1YLEVRSdE",
        "operation_type": "avatarCreate",
        "lines_to_speak": "Hello",
        "voice_gender": "female",
        "avatar_image_url": "TI8NsZCKXU9IibLQMKe2.jpg"
    }
    print(requests.post(serverUrl, json=requestData).text)

@app.get("/passive_agressive")
def passive_agressive():
    args=dict(request.args)
    if presentation:
        return make_response("")
    else:
        crime=args["crime"]
        promtp2 = f"""generate one passive aggressive taunt in simple hindi using simple and casual words most likely to be used in a casual human conversation most likely to be said by an Indian mother by using the following details
crime: {crime}
randomness: 0.6969
ALSO MAX 25 WORDS!!!!
ONLY 175 CHARACTERS
"""
        response = ""
        for data in chatbot.ask(promtp2):
            print(data)
            response=data
        print("Hi")
        return make_response(response)

@app.get("/add_task")
def add_task():
    args=dict(request.args)
    email=args["email"]
    datetime=args["datetime"]
    video_id=args["videoid"]
    crime=args["crime"]
    task=args["task"]
    res=users.get(args["email"])
    res["tasks"].append({
        "id":video_id,
        "email":email,
        "datetime":datetime,
        "crime":crime,
        "task":task
    })
    users.set(args["email"],res)
    return make_response(True)

@app.get("/get_tasks")
def get_tasks():
    args=dict(request.args)
    return make_response(users.get(args["email"])["tasks"])

@app.get("/remove_task")
def remove_tasks():
    args=dict(request.args)
    res=users.get(args["email"])
    res_copy=[]
    for x in res["tasks"]:
        if x["id"]!=args["id"]:
            res_copy.append(x)
    res["tasks"]=res_copy
    users.set(args["email"],res)
    return make_response(True)

@app.get("/lockdown")
def lockdown():
    open("alert","a").write("hello")
    return make_response(True)

@app.get("/unlockdown")
def unlockdown():
    open("alert","w").write("")
    return make_response(True)

app.run(port=8080)