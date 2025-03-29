import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReceipList from './ReceipList';
import RecipeDetail from './RecipeDetail';
import Sidebar from './Sidebar';
import './App.css';
import React from 'react';

function App() {
	return (
		<>
			<Router>
				<Sidebar />
				<main className='main-content'>
					<Routes>
						<Route path='/recipes' element={<ReceipList />} />
						<Route path='/recipes/:id' element={<RecipeDetail />} />
					</Routes>
				</main>
			</Router>
		</>
	);
}

export default App;
