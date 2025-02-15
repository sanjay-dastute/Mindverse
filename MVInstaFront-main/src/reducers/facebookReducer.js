import { createSlice } from "@reduxjs/toolkit";

// const facebookState = {
//     oraganizationId: '',
//     token: '',
//     otherUserId: ''
// }

const initialState = {
    reload: 1,
    userId: '',
    
}

export const facebookSlice = createSlice({
    name: 'facebookSlice',
    initialState,
    reducers: {
        setReload: (state) => {
            state.reload += 1;
        },
        setFacebookState: (state, action) => {
            state.userId = action.payload;
        }
    }
})

export {initialState};
export const {setReload, setFacebookState} = facebookSlice.actions;
export default facebookSlice.reducer;