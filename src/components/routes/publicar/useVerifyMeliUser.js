import axios from "axios";
import { useEffect, useState } from "react";

export const useVerifyMeliToken = (token) => {
  const [meliUser, setUser] = useState(null);
  const [valid, setValid] = useState(null); // true, false o null
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const check = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const axiosProvider = (url) => axios.get(url, { headers });
        const res = await axiosProvider("https://aguazarca.com.ar/api/get_user_me.php");
        if (res.status !== 200) {
          throw new Error("Invalid token or user not found");
        }
        const data = await res.data;
        setUser(data);
        setValid(true);
      } catch (err) {
        setError(err.message);
        setValid(false);
      }
    };

    check();
  }, [token]);

  return { meliUser, valid, error };
};
