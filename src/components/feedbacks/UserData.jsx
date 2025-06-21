import React, { useEffect, useState } from "react";
import userApi from "../../api/userApi";

const UserData = ({ userId }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    userApi.getUserById(userId).then((res) => {
      setUser(res);
    }).catch(err=>console.error(err));
  }, [userId]);

  return (
    <h3 className="font-medium truncate">{user?.name || "Anonymous User"}</h3>
  );
};

export default UserData;
