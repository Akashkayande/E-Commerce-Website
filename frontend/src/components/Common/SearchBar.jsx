import React, { useState } from 'react'
import {HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProductsByFilters, setFilters } from '../../redux/slices/productSlice';


const SearchBar = () => {
    const [searchTerm,setSearchTerm] = useState("");
    const [isOpen,setIsopen]=useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSearchToggle = ()=>{
        setIsopen(!isOpen)
    }
    const handleSearch=(e)=>{
        e.preventDefault();
        dispatch(setFilters({search : searchTerm}));
        dispatch(fetchProductsByFilters({search : searchTerm}));
        navigate(`/collections/all?search=${searchTerm}`)
        setSearchTerm("");

        setIsopen(false)
    }
  return (
    <div className={`flex items-center justify-center w-full transition-all duration-300 ${isOpen? "absolute top-0 left-0 w-full h-24 z-50":"w-auto"}`}>
        {isOpen ? (<form onSubmit={handleSearch} className='relative flex items-center justify-center w-full'>
            <div className='relative w-1/2 cursor-pointer'>
                <input onChange={(e)=>setSearchTerm(e.target.value)} type="text" placeholder='Search' value={searchTerm}  className='bg-gray-100 px-4 py-2 pl-2 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700'/>
                <button type='submit' className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800'>
                    <HiMagnifyingGlass/>
                </button>

            </div>
            <button type='button' onClick={handleSearchToggle} className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 
            hover:text-gray-800 cursor-pointer'>
                <HiMiniXMark className='h-6 w-6'/>
            </button>

        </form>):(
            <button onClick={handleSearchToggle}>
                <HiMagnifyingGlass className='h-6 w-6 cursor-pointer' />
                
            </button>
        )}
    </div>
  )
}

export default SearchBar
