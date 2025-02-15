import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    reload: 1,
    loading: true,
    selectedMenu: "0",
    userRole: "unauthorized",
    darkMode: false,
    collapsed: false,
    screenSize: null
    // dashboardState,

}

export const dashboardSlice = createSlice({
    name: 'DashboardSlice',
    initialState,
    reducers: {
        
        setSelectedMenu: (state, action) => {
            state.selectedMenu = action.payload;
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setReload: (state) => {
            state.reload += 1;
        },
        setDarkMode: (state, action) => {
            state.darkMode = action.payload;
        },
        setCollapsed: (state, action) => {
            state.collapsed = action.payload;
        },
        setScreenSize: (state, action) => {
            state.screenSize = action.payload;
        }

    }
})

export { initialState };
export const { setSelectedMenu, setUserRole, setLoading, setReload, setDarkMode, setCollapsed, setScreenSize } = dashboardSlice.actions;
export default dashboardSlice.reducer;
