import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.post(
        "http://192.168.29.213/api/auth/register",
        {
          username,
          email,
          password,
        }
      );
      console.log(data);
      //   await AsyncStorage.setItem("token", data.token);
      //   await AsyncStorage.setItem("user", JSON.stringify(data.user));
      //   set({ token: data.token, user: data.user, isLoading: false });
    } catch (error) {
      console.log("Error in register", error);
      set({ isLoading: false });
    }
  },
}));
