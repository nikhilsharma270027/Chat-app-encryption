import React, { useRef} from "react";
import ChatContext from "@/Context/chat/ChatContext";
import { useContext, useState } from "react";
import { toaster } from "./ui/toaster";
import { Drawer, useDisclosure } from "@chakra-ui/react";
// const { setOpen,onClose, onOpen, open } = useDisclosure();
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import axios from "axios";

export default function NavBar(props: any) {
  const [open, setOpen] = useState(false)
  const context = useContext(ChatContext);
  const { accessChat } = context;
  // const btnRef = React.useRef("");
  const { socket } = props;
  const [loading, setloading] = useState(false);
  const [users, setusers] = useState([]);
  const [search, setsearch] = useState("");
  const [result, setResult] = useState(false);

  // const toast = toaster();

  //enabling drawer from chatlist //
  //  const enableDrawer = () => {
  //     if(toggleSearch) {
  //         onOpen();
  //     }
  
  const onChange = async (e: any) => {
    try{
      setloading(true);
      setsearch(e.target.value);
      const token = localStorage.getItem("token"); // Ensure this exists

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat/searchUser?search=${e.target.value}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` // Ensure "Bearer" is properly formatted
          }
        }
      );


      setloading(false);
      console.log("fecthing users", response.data)
      setusers((await response).data)
      if( response) {
        setResult(true)
      } else {
        setResult(false)
      }

      if(!e.target.value) {
        setusers([]);
      }
    } catch (error) {
      setloading(false);
      toaster.create({
        description: "Internal server error",
        type: "warning",
        duration: 3000,
      });
    }
  }

  return (
    <nav className="  hidden md:flex  items-center justify-center w-20  xl:w-[6%]   py-10 text-white  bg-[#B3D8A8] ">
      <div className="bg-[rgb(36,36,36)]  w-14 space-y-4 pb-5 pt-2 rounded-lg flex flex-col  items-center justify-center">
        <img
          alt=""
          className="w-10  "
          src={
            "https://res.cloudinary.com/dynjwlpl3/image/upload/v1674985284/Chat-app/logo_rmgpil.png"
          }></img>
        <i
          title="Search"
          onClick={() => setOpen(true)}
          className=" text-[rgb(111,111,111)]  text-xl cursor-pointer fa-solid fa-magnifying-glass"></i>
        <DrawerRoot 
            open={open}
            placement={"start"}
            onOpenChange={(e) => setOpen(e.open)}
            // finalFocusRef={btnRef}
          >
            <DrawerBackdrop overflow={"hidden"}
            bg={"rgb(27,27,27)"}
            color={"white"}/>
            <DrawerTrigger />
            <DrawerContent overflow={"hidden"}  bg={"rgb(27,27,27)"} color={"white"}>
              {/* <DrawerCloseTrigger onClick={() => setOpen((prev) => !prev)}/> */}
              <DrawerHeader bg={"rgb(36,36,36)"}>
              <div className="flex justify-between p-5 align-middle">
                Search for user
                <i
                  onClick={() => setOpen((prev) => !prev)}
                  className="fa-solid cursor-pointer text-xl mt-[1px] fa-xmark"
                ></i>
              </div>
                <DrawerTitle />
              </DrawerHeader>
              <DrawerBody padding={"0"} position="relative" overflow={"hidden"}>
              <input
                onChange={onChange}
                value={search}
                className=" mx-4 mt-6 border-[rgb(156,150,150)] px-4 outline-none w-[17rem] py-3
                    rounded-lg border-2  bg-transparent text-white"
                placeholder="Enter names or email address"
                autoComplete="off"
              ></input>
              {
                !loading && (
                  <div className="flex h-[73vh]  pb-1check overflow-y-scroll styleScroll mt-6 flex-col ">
                  {users.map((user, index) => {
                    return (
                      <div
                        onClick={() => {
                          accessChat(user._id);
                          // closeTheTab();
                        }}
                        className="flex cursor-pointer px-4 hover:bg-[rgb(58,58,58)]  py-[6px]  items-center space-x-2"
                        key={index}
                      >
                        <img
                          className="w-12 rounded-full h-12"
                          alt=""
                          src={user.personal_info.profile_img}
                        ></img>
                        <p>{user.personal_info.fullname}</p>
                      </div>
                    );
                  })}
                </div>
                )
              }
              {!result &&  !loading && (
                <div className="text-white h-[70vh] top-0 mx-20  absolute flex justify-center items-center">
                  No result found
                </div>
              )}
              </DrawerBody>
              <DrawerFooter />
            </DrawerContent>
          </DrawerRoot>
      </div>
    </nav>
  );
}
