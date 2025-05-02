import Login from "@/src/features/authentication/containers/login/Login";
import Register from "@/src/features/authentication/containers/register/Register";
import IDVerification from "@/src/features/authentication/containers/register/IDVerification";
import PreferenceSelection from "@/src/features/authentication/containers/register/PreferenceSelection";
import InputForgot from "@/src/features/authentication/containers/forgot/InputForgot";
import OtpForgot from "@/src/features/authentication/containers/forgot/OtpForgot";
import NewPassword from "@/src/features/authentication/containers/forgot/NewPassword";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { TabbarNavigation } from "./TabbarBottom";

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    IDVerification: {emailOrPhone: String,password:String};
    PreferenceSelection: {email:String};
    InputForgot: undefined;
    OtpForgot: {email:String};
    NewPassword: {email:String};
    TabbarNavigation: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigation() {
  return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{
           headerShown: false,
        }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="IDVerification" component={IDVerification} />
          <Stack.Screen name="PreferenceSelection" component={PreferenceSelection} />
          <Stack.Screen name="InputForgot" component={InputForgot} />
          <Stack.Screen name="OtpForgot" component={OtpForgot} />
          <Stack.Screen name="NewPassword" component={NewPassword} />
          <Stack.Screen name="TabbarNavigation" component={TabbarNavigation} />
      </Stack.Navigator>
  );
}