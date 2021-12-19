import './App.css';
import { useEffect, useState, useRef } from "react"

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyD1zf-FQSL322bUkuOlMTXMjPji9LCWrEk",
  authDomain: "chat-app-2627a.firebaseapp.com",
  databaseURL: "https://chat-app-2627a.firebaseio.com",
  projectId: "chat-app-2627a",
  storageBucket: "chat-app-2627a.appspot.com",
  messagingSenderId: "609641492181",
  appId: "1:609641492181:web:c467b9321bf5d268877c5c"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

const CreateMessage = ({ chattingTo, currentUser, MessagesRef, scroller }) => {

  const [message, setMessage] = useState();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    let currentTime = new Date();
    if (!message) {
      return;
    }
    let newMessage = {
      from: currentUser.uid.toString(),
      to: chattingTo.toString(),
      status: "",
      message: message,
      time: currentTime,
    }
    // MessagesRef.on('child_added', snap => {
    //   console.log(snap);
    // })

    //automatically edits status of messsage to send as soon as we recieve back the newly added message
    MessagesRef.add(newMessage).then(el => {
      // console.log(el.id);
      scroller.current.scrollIntoView({ behaviour: "smooth" })
      MessagesRef.doc(el.id).update({
        status: "sent"
      })

      // let latestMessageId;
      // MessagesRef
      //   .where('to', '==', chattingTo.toString())
      //   .where('from', '==', currentUser.uid.toString())
      //   .where('time', '==', currentTime)
      //   .get().then(el => {
      //     el.forEach(doc => latestMessageId = doc.id);
      //     MessagesRef.doc(latestMessageId).update({
      //       status: "sent"
      //     })
      //   })

      // MessagesRef.orderBy('time').equalTo("12345TG4").once("value", function (snapshot) {
      //   snapshot.forEach(function (child) {
      //     child.ref.update(updateData);
      //   });
      // });
    }).catch(err => console.log(err))
    setMessage('');
    // console.log(newMessage);
  }
  return (
    <form onSubmit={handleSubmit} style={{ position: "relative", textAlign: 'right', justifyContent: "flex-end", marginTop: '1.5rem', display: 'flex', marginRight: "2rem", paddingBottom: "2rem" }}>
      <input value={message} type="text" onChange={(e) => setMessage(e.target.value)} style={{ width: "100%", maxWidth: "400px", padding: "0.25rem 1rem", border: "1px solid #bebebe", borderRadius: '1rem' }}></input>
      <button type="submit" style={{ fontFamily: "Poppins", color: "black", background: "white", border: "0.5px solid #bebebe", padding: " 0.25rem 1rem", borderRadius: '1rem', marginLeft: '1rem' }}>Submit</button>
    </form>
  )
}

const MessagesView = ({ messages, currentUser, chattingTo, scroller }) => {
  return (
    <div style={{ padding: '2rem 2rem', borderRadius: "5%", width: 575, height: "300px", overflowY: "scroll", position: "relative", margin: '0.25rem' }}>
      {messages
        .filter(m => (m.from.toString() === currentUser.uid.toString() && m.to.toString() === chattingTo.toString()) ||
          (m.from.toString() === chattingTo.toString() && m.to.toString() === currentUser.uid.toString()))
        .map(el => {
          if (el.from.toString() === currentUser.uid.toString()) {
            return <p style={{ textAlign: 'right' }} > {el.message} <sub>{el.status}</sub></p>
          } else {
            return <p style={{ textAlign: 'left' }}> {el.message} </p>
          }
        })}
      <div ref={scroller}></div>
    </div>)
}
const ChatBox = ({ chattingTo, currentUser, MessagesRef, messages }) => {

  const scroller = useRef();

  MessagesRef.onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        // console.log(change.doc.data());
        // console.log(chattingTo && chattingTo.toString(), change.doc.data());
        if (change.doc.data().to === currentUser.uid.toString() && change.doc.data().status === "sent") {
          // console.log(change.doc.id, "----------------", change.doc.data());
          if (chattingTo && (chattingTo.toString() === change.doc.data().from.toString()) && currentUser.uid.toString() === change.doc.data().to) {
            // console.log("--------------------");
            // console.log(chattingTo && chattingTo.toString(), change.doc.data().from)
            // console.log("--------------------");
            MessagesRef.doc(change.doc.id).update({
              status: "seen"
            })
          } else {
            MessagesRef.doc(change.doc.id).update({
              status: "delivered"
            })
          }
        }
      }
    });
  });


  useEffect(() => {
    if (chattingTo !== null) {

      MessagesRef
        .where('to', '==', currentUser.uid.toString())
        .where('from', '==', chattingTo.toString())
        .where('status', '==', 'delivered')
        .get().then(el => {
          el.forEach(doc => {
            // console.log("updating from use effect to seen");
            MessagesRef.doc(doc.id).update({
              status: "seen"
            })
          })

        })
    }
    // console.log("from use effect");
  }, [chattingTo])

  // console.log(messages);


  return (chattingTo &&
    <div style={{ border: '1px solid #bebebe', borderRadius: "5%", minHeight: "300px", }} >
      {messages ? <MessagesView scroller={scroller} messages={messages} chattingTo={chattingTo} currentUser={currentUser}></MessagesView> : "no messages to show"}
      <CreateMessage scroller={scroller} chattingTo={chattingTo} currentUser={currentUser} MessagesRef={MessagesRef}></CreateMessage>

    </div>)
}


const ChatView = ({ currentUser, chattingTo, setChattingTo, messages, MessagesRef }) => {
  return <>
    <div style={{ maxWidth: 940, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flexShrink: "2" }}>
      <p style={{ marginRight: '2rem', fontFamily: "Poppins" }}>logged in as<b> {currentUser.displayName}</b></p>
      <SignOut setChattingTo={setChattingTo} currentUser={currentUser}></SignOut>
    </div>
    <div style={{ maxWidth: 1240, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '2rem', flexWrap: 'wrap' }}>
      <Users currentUser={currentUser} setChattingTo={setChattingTo} chattingTo={chattingTo}> </Users>
      <ChatBox chattingTo={chattingTo} currentUser={currentUser} messages={messages} MessagesRef={MessagesRef}></ChatBox>
    </div>
  </>
}

const SignIn = () => {

  const SignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return <button style={{ marginTop: '2rem', cursor: 'pointer', fontFamily: "Poppins", color: "black", background: "white", border: "0.5px solid #bebebe", padding: " 0.25rem 1rem", borderRadius: '1rem' }} onClick={SignInWithGoogle}>Signin with google</button>
}

const SignOut = ({ currentUser, setChattingTo }) => {
  const SignOutFromGoogle = () => {
    auth.currentUser && auth.signOut().then(e => {
      const UsersRef = firestore.collection('users');
      console.log(currentUser.id);
      setChattingTo(null);
      UsersRef.doc(currentUser.uid).update({
        status: "offline",
      })
    });
  }
  return <button style={{ cursor: 'pointer', fontFamily: "Poppins", color: "black", background: "white", border: "0.5px solid #bebebe", padding: " 0.25rem 1rem", borderRadius: '1rem' }} onClick={SignOutFromGoogle}>Sign Out</button>
}

const Users = ({ currentUser, setChattingTo, chattingTo }) => {


  // let users = [{ name: 'abc', isOnline: true }, { name: 'bcd', isOnline: false }];
  const UsersRef = firestore.collection('users');
  const query2 = UsersRef.orderBy('username')
  // console.log(UsersRef.orderBy('username'));
  const [users] = useCollectionData(query2, { idField: 'id' })
  // console.log(users);
  // return "users here";
  // console.log(currentUser);
  if (users) {
    return (
      <div style={{ border: '1px solid #bebebe', padding: '2rem 2rem', borderRadius: "1.75rem", width: "200px", margin: '0.25rem' }}>
        <h3 style={{ textAlign: 'center' }}>Friends</h3>
        {users.filter(el => el.id != currentUser.uid).map(user => <p onClick={() => setChattingTo(user.id)} key={user.id} style={{ background: (chattingTo && chattingTo === user.id.toString()) ? "#aae3ff " : "white", cursor: 'pointer', textAlign: 'center', borderRadius: '0.5rem' }}>{user.username} <b style={{ color: user.status === "online" ? "green" : "red" }}>{user.status}</b></p>)
        }
      </div >
    )

  }
  return "loading";
}
const App = () => {
  const [user] = useAuthState(auth);
  const [chattingTo, setChattingTo] = useState(null);
  const MessagesRef = firestore.collection('messages');
  const query = MessagesRef.orderBy('time')
  const [messages] = useCollectionData(query)
  // console.log(user);
  useEffect(() => {
    if (user) {
      setChattingTo(null);
      const UsersRef = firestore.collection('users');
      console.log(user.id);
      UsersRef.doc(user.uid).set({
        username: user.displayName,
        isChattingTo: null,
        status: "online",
      })
      // const MessagesRef = firestore.collection('messages');
      // const query = MessagesRef.orderBy('time')
      // MessagesRef
      //   .where('to', '==', user.uid.toString())
      //   .where('status', '==', "sent")
      //   .get().then(el => {
      //     el.forEach(doc => {
      //       MessagesRef.doc(doc.id).update({
      //         status: "delivered"
      //       })
      //     });

      //   })

    }
  }, [user])
  return (
    <div style={{ maxWidth: '940px', margin: 'auto', width: '92%' }}>
      {(!user) ? <SignIn setChattingTo={setChattingTo}></SignIn> : <ChatView messages={messages} MessagesRef={MessagesRef} currentUser={user} chattingTo={chattingTo} setChattingTo={setChattingTo}></ChatView>}
    </div>)
    ;
}

export default App
