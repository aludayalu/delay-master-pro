import Head from "next/head";
import { Text, Link, Navbar, Spacer, Divider, Button, Card, Input, Loading, Row, Textarea, Modal } from "@nextui-org/react";
import { useSession, signIn, signOut } from "next-auth/react"
import axios from "axios";
import useSWR from 'swr'
import { useState } from "react";

const fetcher = (...args) => fetch(...args).then((res) => res.json())

const token = 'X2qHYAoUpqEE1yf2XE0ez1YLEVRSdE';
const operationType = 'avatarCreate';
var linesToSpeak = 'Hello, this is a test';
const voiceGender = 'female';
const avatarImageUrl = '8ML4rOQRnFlQC9QCMaIA.jpg';

function generateAvatar(token, operationType, linesToSpeak, voiceGender, avatarImageUrl) {
    const serverUrl = 'http://20.84.94.16:9090/api/generate_avatar';
    const requestData = {
        token: token,
        operation_type: operationType,
        lines_to_speak: linesToSpeak,
        voice_gender: voiceGender,
        avatar_image_url: avatarImageUrl
    };
    return axios.post(serverUrl, requestData)
}

export default function Home() {
    const [tasks,setTasks]=useState([])
    var [done,setDone]=useState([])
    var [first,setFirst]=useState(true)
    var [current_lockdown,setCurrentLockdown]=useState({"id":""})
    const { data: session } = useSession()
    if (session==undefined) {
        var email=""
    } else {
        var email=session.user.email
    }
    var { data, error } = useSWR('http://localhost:8080/details?email='+email, fetcher)
    if (session) {
    } else {
        return (<>
            <div style={{height:"100vh",width:"100vw"}} className="wrapper">
                <Card css={{padding:"$5",bgBlur:"#0f111466",mw:"800px"}}>
                    <Card.Header className="wrapper">
                        <Text h1>Sign-In to Delay Master Pro</Text>
                    </Card.Header>
                    <Card.Body className="wrapper">
                        <Button css={{width:"50%"}} onClick={()=>{
                            signIn("google")
                        }}>Sign-In with Google</Button>
                    </Card.Body>
                </Card>
            </div>
        </>)
    }
    if (error) return <div>Failed to load</div>
    if (!data) return (
        <>
        <div style={{height:"100vh",width:"100vw"}} className="wrapper">
            <Loading></Loading>
        </div>
        </>
    )
    async function check_reminder() {
        data=(await axios.get('http://localhost:8080/details?email='+email)).data
        data.tasks.map((x)=>{
            var date=(new Date())
            console.log(x.datetime,`${date.getFullYear()}-0${Number(date.getMonth())+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}`,done)
            if (x.datetime==`${date.getFullYear()}-0${Number(date.getMonth())+1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}` && !done.includes(x.id)) {
                var copydone=done
                copydone.push(x.id)
                setDone(copydone)
                console.log(done)
                axios.get("http://localhost:8080/lockdown")
                setCurrentLockdown({"id":x.id})
            }
        })
        setTimeout(check_reminder,1000)
    }
    if (first) {
        setFirst(false)
        setTasks(data.tasks)
        console.log(data.tasks)
        check_reminder()
    }
    return (
        <>
            <Head>
                <title></title>
            </Head>

            <Navbar isBordered isCompact variant="sticky" css={{bgBlur: "#000000"}}>
                <Navbar.Brand>
                    <Text h3 css={{textGradient: "45deg, $blue600 -20%, $pink600 50%"}}>Delay Master PRO</Text>
                </Navbar.Brand>
                <Navbar.Content activeColor={"secondary"}>
                    <Navbar.Link onClick={()=>{signOut()}}>
                        SignOut
                    </Navbar.Link>
                </Navbar.Content>
            </Navbar>
            <Row>
                <Card css={{padding:"$5",width:"30vw",height:"100vh",bgBlur:"#0f111466"}}>
                    <Card.Header className="wrapper">
                        <Text h1>Tasks</Text>
                    </Card.Header>
                    <Card.Body css={{marginTop:"-2vw",overflowY:"scroll",overflowX:"hidden",maxH:"90vh"}}>
                        <div style={{"overflowY":"scroll"}}>
                        {tasks.map((x)=>{
                            return (
                                <>
                                <Card css={{mw:"400px"}}>
                                    <Card.Body>
                                        <Row>
                                        <Text h4 color="success">Task:</Text>
                                        <Spacer y={.1}></Spacer>
                                        <Text h4>{x.task}</Text>
                                        </Row>
                                        <Row>
                                        <Text h4 color="success">Time:</Text>
                                        <Spacer y={.1}></Spacer>
                                        <Text h4>{x.datetime}</Text>
                                        </Row>
                                        <Row>
                                        <Text h4 color="success">Crime:</Text>
                                        <Spacer y={.1}></Spacer>
                                        <Text h4 css={{marginLeft:"-0.5vw"}}>{x.crime}</Text>
                                        </Row>
                                    </Card.Body>
                                    <Card.Footer css={{marginTop:"-2vw"}} className="wrapper">
                                        <Button color={"error"} onClick={async ()=>{
                                            await axios.get("http://localhost:8080/remove_task?id="+x.id+"&email="+email)
                                            setTasks((await axios.get('http://localhost:8080/details?email='+email)).data.tasks)
                                        }}>Delete</Button>
                                    </Card.Footer>
                                </Card>
                                <Spacer></Spacer>
                                </>
                            )
                        })}
                        </div>
                    </Card.Body>
                </Card>
                <div style={{width:"70vw",height:"100vh"}} className="wrapper">
                    <div>
                    <div className="wrapper">
                        <Text h1>Set a Guilty Reminder</Text>
                    </div>
                    <Textarea id="crime_data" placeholder="Fill in the details about your crime, date and time of when we should remind you for that and any other information about the same." width="50vw"></Textarea>
                    <Spacer></Spacer>
                    <div className="wrapper">
                        <Input type="datetime-local" id="time"></Input>
                    </div>
                    <Spacer></Spacer>
                    <div className="wrapper">
                        <Button id="submit_button" onClick={async ()=>{
                            document.getElementById("submit_loader").style.display="block"
                            document.getElementById("submit_button").style.display="none"
                            // var xdata=(await axios.get("http://localhost:8080/question?question="+document.getElementById("crime_data").value)).data
                            var xdata={
                                "crime": "Wake-up Reminder",
                                "reminder_text": "Please wake me up."
                            }
                            var datetime=document.getElementById("time").value;
                            // var passive_agressive=(await axios.get("http://localhost:8080/passive_agressive?crime="+`${xdata.crime} , reminder text: ${xdata.reminder_text}`)).data.message
                            var passive_agressive='"Hello Everyone!"'
                            console.log(passive_agressive.message,"...?")
                            var videoid=(await generateAvatar(token,operationType,passive_agressive.split('"')[1],voiceGender,avatarImageUrl)).data.data
                            console.log(videoid)
                            await axios.get("http://localhost:8080/add_task?"+`email=${email}&datetime=${datetime}&videoid=${videoid}&crime=${xdata.crime}&task=${xdata.reminder_text}`)
                            setTasks((await axios.get('http://localhost:8080/details?email='+email)).data.tasks)
                            document.getElementById("submit_loader").style.display="none"
                            document.getElementById("submit_button").style.display="block"
                            document.getElementById("crime_data").value=""
                        }}>Submit</Button>
                        <Loading id="submit_loader" style={{display:"none"}}></Loading>
                    </div>
                    </div>
                </div>
            </Row>
            <Modal
            open={!current_lockdown.id==""}
            >
            {/* ${current_lockdown.id} */}
            <video src={`http://20.84.94.16:9090/generated/Rf5GngG0OYiqbidHnMPw.mp4`} autoPlay={!current_lockdown.id==""}></video>
            {(()=>{
                setTimeout(()=>{
                    if (current_lockdown.id!=="") {
                    setCurrentLockdown({id:""})
                    axios.get("http://localhost:8080/unlockdown")
                    }
                },10000)
            })()}
            </Modal>
        </> 
    )
}