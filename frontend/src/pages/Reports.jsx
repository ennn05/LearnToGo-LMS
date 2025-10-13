import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/apiCalls";
import "../styles/Reports.css";
import useStore from "../store";

function Reports() {
    // Current logged-in user
    const { user, signOut } = useStore((state) => state);
}