import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './ReceipList.css';

type RecipeDetail = {
	image: string;
	name: string;
	cuisine: string;
	caloriesPerServing: number;
	cookTimeMinutes: number;
	instructions: string[];
	ingredients: string[];
	tags: string[];
};

function ReceipDetail() {
	const { id } = useParams();

	const [detail, setDetail] = useState<RecipeDetail | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<null | string>(null);

	const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

	useEffect(() => {
		const fetchRecipeDetail = async () => {
			try {
				const response = await fetch(`https://dummyjson.com/recipes/${id}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error('Network response is not ok');
				}

				setDetail(data);
			} catch (error) {
				console.log(error);
				setError('Error!!');
			} finally {
				setLoading(false);
			}
		};

		fetchRecipeDetail();
	}, [id]);

	if (loading) return <p>Loading Detail...</p>;
	if (error) return <p>{error}</p>;

	return (
		<>
			<div className='recipe-item'>
				<img
					src={detail?.image}
					alt={detail?.name}
					className='recipe-image-detail'
				/>
				<h2 className='recipe-title' onClick={() => setIsOpenModal(true)}>
					{detail?.name}
				</h2>

				{isOpenModal && (
					<div className='modal-container'>
						<div className='modal-content'>
							<p
								className='modal-close'
								onClick={() => setIsOpenModal((prev) => !prev)}
							>
								❌
							</p>
							<p className='modal-text'>Bet you want some 😎</p>
						</div>
					</div>
				)}

				<div className='recipe-details'>
					<p>
						<strong>👩🏻‍🍳 Cuisine:</strong> {detail?.cuisine}
					</p>
					<p>
						<strong>🏋🏻 Calories:</strong> {detail?.caloriesPerServing}
					</p>
					<p>
						<strong>⏰ Cook Time:</strong> {detail?.cookTimeMinutes} min
					</p>

					<div>
						<strong>🥣 Instructions</strong>
						<ol className='recipe-details-instructions'>
							{detail?.instructions?.map((instruction, index) => (
								<li key={index}>{instruction}</li>
							))}
						</ol>
					</div>
					<p className='recipe-details-ingredients'>
						<strong>🧺 Ingredients: </strong>
						{detail?.ingredients?.join(', ')}
					</p>
					<p className='recipe-details-tags'>
						{detail?.tags?.map((tag, index) => (
							<span key={index} className='recipe-details-tag'>
								{tag}
							</span>
						))}
					</p>
				</div>
			</div>
		</>
	);
}

export default ReceipDetail;
