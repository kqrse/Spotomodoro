import React from 'react';

function SignIn() {
    return (
        <div>
            <header>
                <span className="text-3xl">
                    Welcome to Spotomodoro!
                </span>
                <br/>
                <br/>
                <a className="text-sky-300 text-2xl" href="/api/auth/login" >
                    Sign in to Spotify
                </a>
            </header>
        </div>
    );
}

export default SignIn;