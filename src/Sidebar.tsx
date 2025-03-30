import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const navigate = useNavigate();
	const handleFilter = (tag: string) => {
		navigate(`/recipes?tag=${tag}`);
	};

	return (
		<>
			<button
				className='hamburger-btn'
				onClick={() => setIsSidebarOpen((prev) => !prev)}
			>
				{isSidebarOpen ? '❌' : '🍙'}
			</button>
			{isSidebarOpen && (
				<div
					className='sidebar-overlay'
					onClick={() => setIsSidebarOpen(false)}
				>
					<div
						className={`responsive-sidebar ${isSidebarOpen ? 'open' : ''}`}
						onClick={(e) => e.stopPropagation()}
					>
						<h2>Menu</h2>
						<ul className='responsive-bar-list'>
							<li
								onClick={() => {
									navigate('/recipes');
									setIsSidebarOpen(false);
								}}
							>
								All
							</li>
							<li
								onClick={() => {
									handleFilter('Salad');
									setIsSidebarOpen(false);
								}}
							>
								Salad
							</li>
							<li
								onClick={() => {
									handleFilter('Vegetarian');
									setIsSidebarOpen(false);
								}}
							>
								Vegetarian
							</li>
						</ul>
					</div>
				</div>
			)}
		</>
	);
}

export default Sidebar;
