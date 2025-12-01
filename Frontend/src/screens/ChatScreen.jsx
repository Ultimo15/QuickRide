import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";
import Loading from "./Loading";
import Avatar from "../components/Avatar";
import showToast from "../utils/toast";

/**
 * ChatScreen - Chat en tiempo real estilo WhatsApp profesional
 * Burbujas mejoradas, indicador de typing, animaciones
 */
function ChatScreen() {
  const { rideId, userType } = useParams();
  const navigation = useNavigate();
  const scrollableDivRef = useRef(null);

  const { socket } = useContext(SocketDataContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [socketID, setSocketID] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const currentUser =
    JSON.parse(localStorage.getItem("userData"))?.data?._id || null;

  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop =
        scrollableDivRef.current.scrollHeight;
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/chat-details/${rideId}`
      );

      // Protecting unauthorised users to read the chats
      if (
        currentUser !== response.data.user._id &&
        currentUser !== response.data.captain._id
      ) {
        Console.log("You are not authorized to view this chat.");
        showToast.error("No autorizado para ver este chat");
        navigation(-1);
        return;
      }
      setMessages(response.data.messages);

      socket.emit("join-room", rideId);
      if (userType == "user") {
        setUserData(response.data.captain);
      }
      if (userType == "captain") {
        setUserData(response.data.user);
      }
      const socketIds = {
        user: response.data.user.socketId,
        captain: response.data.captain.socketId,
      };
      setSocketID(socketIds);
    } catch (error) {
      Console.log("No such ride exists.");
      showToast.error("Error al cargar el chat");
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    socket.emit("message", {
      rideId: rideId,
      msg: message,
      userType: userType,
      time,
    });
    setMessages((prev) => [...prev, { msg: message, by: userType, time }]);

    setMessage("");

    // Emitir evento de "stop typing"
    socket.emit("stop-typing", { rideId });
  };

  // Typing indicator
  const handleTyping = (value) => {
    setMessage(value);

    if (value.length > 0) {
      socket.emit("typing", { rideId, userType });
    } else {
      socket.emit("stop-typing", { rideId });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (userData) {
      scrollToBottom();
    }
  }, [userData]);

  useEffect(() => {
    setTimeout(() => {
      getUserDetails();
    }, 3000);

    socket.on("receiveMessage", ({ msg, by, time }) => {
      setMessages((prev) => [...prev, { msg, by, time }]);
    });

    socket.on("user-typing", ({ userType: typingUserType }) => {
      if (typingUserType !== userType) {
        setIsTyping(true);
      }
    });

    socket.on("user-stop-typing", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, []);

  if (userData) {
    return (
      <div className="flex flex-col h-dvh bg-uber-extra-light-gray">
        {/* HEADER */}
        <motion.div
          className="flex items-center p-4 bg-gradient-to-r from-black to-uber-dark-gray border-b border-white/10 gap-3 shadow-uber"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <motion.button
            onClick={() => navigation(-1)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.button>

          <Avatar
            src={userData?.profilePhoto}
            name={`${userData?.fullname?.firstname} ${userData?.fullname?.lastname}`}
            size="md"
            showStatus={true}
            isOnline={true}
          />

          <div className="flex-1">
            <h1 className="text-lg font-bold text-white leading-tight">
              {userData?.fullname?.firstname} {userData?.fullname?.lastname}
            </h1>
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.p
                  key="typing"
                  className="text-xs text-uber-green font-medium"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  escribiendo...
                </motion.p>
              ) : (
                <motion.p
                  key="online"
                  className="text-xs text-uber-light-gray"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {userType === "user" ? "Conductor" : "Pasajero"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* MESSAGES AREA */}
        <div
          className="overflow-y-auto flex-1 bg-[#E5DDD5] p-4"
          ref={scrollableDivRef}
        >
          <div className="flex flex-col gap-1 w-full">
            <AnimatePresence initial={false}>
              {messages.length > 0 &&
                messages.map((msg, i) => {
                  const isMine = msg.by === userType;
                  return (
                    <motion.div
                      key={i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                    >
                      <div
                        className={`relative max-w-[75%] px-3 py-2 rounded-uber-lg shadow-uber ${
                          isMine
                            ? "bg-uber-green text-white rounded-br-none"
                            : "bg-white text-black rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {msg.msg}
                        </p>
                        <div
                          className={`flex items-center gap-1 justify-end mt-1 ${
                            isMine ? "text-white/70" : "text-uber-medium-gray"
                          }`}
                        >
                          <span className="text-[10px] font-medium">
                            {msg.time}
                          </span>
                          {isMine && (
                            <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {/* TYPING INDICATOR */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-white px-4 py-3 rounded-uber-lg rounded-bl-none shadow-uber">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-uber-medium-gray rounded-full"
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* INPUT AREA */}
        <motion.form
          className="flex items-center p-4 bg-white border-t border-uber-light-gray gap-3"
          onSubmit={sendMessage}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <input
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-uber-extra-light-gray border-2 border-transparent focus:border-black outline-none rounded-uber-xl px-4 py-3 text-black placeholder-uber-medium-gray transition-all"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            autoFocus
            spellCheck="false"
          />
          <motion.button
            type="submit"
            disabled={!message.trim()}
            className="w-12 h-12 bg-uber-green hover:bg-green-600 disabled:bg-uber-medium-gray disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors shadow-uber"
            whileHover={message.trim() ? { scale: 1.1 } : {}}
            whileTap={message.trim() ? { scale: 0.9 } : {}}
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </motion.form>
      </div>
    );
  } else {
    return <Loading />;
  }
}

export default ChatScreen;
