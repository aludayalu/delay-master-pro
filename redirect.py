import flask
from flask import Flask,redirect,request
app=Flask(__name__)

@app.get("/api/auth/callback/google")
def redir():
    print("http://localhost:8888/api/auth/callback/google?"+str(request.query_string)[2:-1])
    return redirect("http://localhost:8888/api/auth/callback/google?"+str(request.query_string)[2:-1])

@app.get("/api/auth/error")
def asohuf():
    return redirect("http://localhost:8888/api/auth/error?"+str(request.query_string[2:-1]))

@app.get("/")
def sdohuf():
    return redirect("http://localhost:8888/home")

app.run(port=3000)