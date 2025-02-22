import axios from "axios";
import React, { useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";

interface userauth {
  length: number;
  map(arg0: (user: any, index: any) => JSX.Element): React.ReactNode;
  access_token: string;
  fullname: string;
  profile_img: string;
  username: string;
}

const AllUser = ({ setReceiver }: { setReceiver: (username: string) => void }) => {
    const [allUser, setAllUser] = useState<userauth>([]);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_DOMAIN}/getuser`
          );
          setAllUser(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
  
      fetchUsers();
    }, []);
  
    return (
      <div className="bg-white h-full w-full overflow-hidden">
        {allUser.length > 0 ? (
          allUser.map((user, index) => (
            <div 
              key={index} 
              className="flex m-4 p-2 justify-between cursor-pointer hover:bg-gray-200"
              onClick={() => setReceiver(user.personal_info.username)} // Set selected user
            >
              <div className="flex">
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.personal_info.profile_img}
                  alt="User"
                />
                <div className="ml-4 flex flex-col justify-center">
                  <p className="font-bold">{user.personal_info.fullname}</p>
                  <p className="text-gray-500">@{user.personal_info.username}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 p-4">No users found</p>
        )}
      </div>
    );
  };
  

export default AllUser;
