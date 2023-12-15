import React from "react";

interface MessageProps {
    color: string;
    children: React.ReactNode;
}

function StyleMessage({ color, children }: MessageProps) {
    // console.log("child");
    const contentStyele = {
        color,
        fontSize: "20px",
    };

    return (
        <p style={contentStyele}>{children}</p>
    );
}

export default StyleMessage;