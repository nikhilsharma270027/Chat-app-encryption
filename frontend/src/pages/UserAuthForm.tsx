import { useContext, useEffect, useRef } from "react";
import AnimationWrapper from "../common/Page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../assets/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";

const UserAuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
    const formRef = useRef<HTMLFormElement>(null);
    // const navigate = useNavigate(); // Initialize navigation
    //@ts-ignore
    const { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    
    const userAuthThroughServer = async (serverRoute: string, formData: Record<string, string>) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({data}) => {
            storeInSession("user", JSON.stringify(data));
            storeInSession("token", JSON.stringify(data.access_token));
            setUserAuth(data);
        })
        .catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                toast.error(error.response.data.error);
            } 
        });
    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;

        const serverRoute = type === "sign-in" ? "/signin" : "/signup";

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        const form = new FormData(formRef.current);
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const { fullname, email, password } = formData;

        if (fullname && fullname.length < 3) {
            return toast.error("Fullname must be at least 3 letters long");
        }
        if (!email || !emailRegex.test(email)) {
            return toast.error("Invalid email");
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be 6 to 20 characters long with a number, an uppercase & a lowercase letter");
        }

        userAuthThroughServer(serverRoute, formData);
        
    };

    // Commented out Google Authentication
    // const handleGoogleAuth = (e: React.MouseEvent<HTMLButtonElement>) => {
    //     e.preventDefault();
    //     authWithGoogle()
    //         .then(user => {
    //             let serverRoute = "/google-auth";
    //             let formData = { access_token: user.accessToken };
    //             userAuthThroughServer(serverRoute, formData);
    //         })
    //         .catch(err => {
    //             toast.error("Trouble logging in through Google");
    //             console.log(err);
    //         });
    // };

    return access_token ? (
        <Navigate to="/" />
    ) : (
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                <form ref={formRef} onSubmit={handleSubmit} className="w-[80%] max-w-[480px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type === "sign-in" ? "Welcome back" : "Join us today"}
                    </h1>

                    {type !== "sign-in" && (
                        <InputBox name="fullname" type="text" placeholder="Full name" icon="fi-rr-user" />
                    )}

                    <InputBox name="email" type="email" placeholder="Email" icon="fi-rr-envelope" />
                    <InputBox name="password" type="password" placeholder="Password" icon="fi-rr-key" />

                    <button className="btn-dark center mt-14" type="submit">
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p>or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    {/* Google Auth Button (Disabled for now) */}
                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center" >
                        {/* <img src={googleIcon} className="w-5 px-5" /> */}
                        Continue with Google
                    </button>

                    {type === "sign-in" ? (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Don't have an account?
                            <Link to="/signup" className="underline text-black text-xl ml-1">
                                Join us today
                            </Link>
                        </p>
                    ) : (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Already a member?
                            <Link to="/signin" className="underline text-black text-xl ml-1">
                                Sign in here.
                            </Link>
                        </p>
                    )}
                </form>
            </section>
        </AnimationWrapper>
    );
};

export default UserAuthForm;
