import {combineReducers, createStore} from 'redux'
import { collapsedReducer } from './reducers/collapsedReducer'
import { loadingReducer } from './reducers/loadingReducer'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' 

const persistConfig = {
    key: 'junyan',
    storage,
    blacklist:['loadingReducer'] //不用持久化loading状态
}

const reducer = combineReducers({
    collapsedReducer,
    loadingReducer
})

//reduxh持久化，将状态存到localstorage
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer)
const persistor = persistStore(store)

export {
    store,
    persistor
}