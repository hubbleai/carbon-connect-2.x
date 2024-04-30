import React, { useEffect, useState } from 'react';
import GithubAuthScreen from "./GithubAuthScreen";
import GithubRepoScreen from "./GithubRepoScreen";

function GithubScreen({
    buttonColor, labelColor, activeIntegrations, setActiveStep, pauseDataSourceSelection, setPauseDataSourceSelection
}) {
    const [step, setStep] = useState("credentials")
    const [username, setUsername] = useState('');
    if (step == "credentials") {
        return <GithubAuthScreen
            buttonColor={buttonColor}
            labelColor={labelColor}
            username={username}
            setUsername={setUsername}
            setStep={setStep}
        />
    } else {
        setPauseDataSourceSelection(true)
        return <GithubRepoScreen
            username={username}
            activeIntegrations={activeIntegrations}
            setActiveStep={setActiveStep}
            pauseDataSourceSelection={pauseDataSourceSelection}
            setPauseDataSourceSelection={setPauseDataSourceSelection}
        />
    }
}

export default GithubScreen