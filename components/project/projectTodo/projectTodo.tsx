'use client';
import { Cards, List, ProjectDetails } from '@/types/project';
import { taskPayload } from '@/types/task';
import { Dot, Ellipsis, Plus } from 'lucide-react'
import { useEffect, useState } from 'react';

export default function ProjectTodo({ data }: { data: ProjectDetails | undefined }) {
    const [lists, setLists] = useState<List[]>(data?.lists || []);
    const [draggingCard, setDraggingCard] = useState<{ cardId: string; sourceListId: string } | null>(null);

    useEffect(() => {
        setLists(data?.lists || []);
    }, [data])
    

    const handleDragStart = (e: React.DragEvent, cardId: string, sourceListId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
         setDraggingCard({ cardId, sourceListId });
      e.dataTransfer.setData('cardId', cardId);
      e.dataTransfer.setData('sourceListId', sourceListId);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('dragging'); // Remove class after dragging ends
    };

    const handleDrop = (e: React.DragEvent, targetListId: string) => {
      const cardId = e.dataTransfer.getData('cardId');
      const sourceListId = e.dataTransfer.getData('sourceListId');
  
      if (sourceListId !== targetListId) {
        setLists((prevLists) => {
          // Find the card to move
          let cardToMove: Cards | null = null;
          const updatedLists = prevLists.map((list) => {
            if (list._id === sourceListId) {
              cardToMove = list.cards.find((card) => card._id === cardId) || null;
              return {
                ...list,
                cards: list.cards.filter((card) => card._id !== cardId),
              };
            }
            return list;
          });
  
          // Add the card to the new list
          if (cardToMove) {
            return updatedLists.map((list) => {
              if (list._id === targetListId) {
                return {
                  ...list,
                  cards: [...list.cards, cardToMove!],
                };
              }
              return list;
            });
          }
        //   setDraggingCard(null);
          return prevLists;
        });
      }
    };
  
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    return (
        <section className="overflow-x-auto section1 ">
            <div className="grid grid-flow-col gap-4 my-5 auto-cols-[minmax(25%,1fr)]">
                {/* <!-- To Do Column --> */}
                {lists.map(list => (
                    <div className='rounded-xl bg-gray-100 p-2'  key={list._id} 

                    onDrop={(e) => handleDrop(e, list._id)}
                    onDragOver={handleDragOver}
                   
                    >
                        <div className={`flex justify-between items-center pb-4 pt-2 mb-4 border-b-2 
                            ${list.name === 'TO DO' ? ' border-gray-500' :
                                list.name === 'IN PROGRESS' ? 'border-amber-500' :
                                    list.name === 'IN REVIEW' ? 'border-blue-500' :
                                        list.name === 'BUG' ? 'border-red-500' :
                                            list.name === 'DONE' ? 'border-green-500' :
                                                ""}`}>
                            <div className='flex items-center'>
                                <Dot className={`w-3 h-3 rounded-full mr-2
                                    ${list.name === 'TO DO' ? ' bg-gray-500 text-gray-500' :
                                        list.name === 'IN PROGRESS' ? 'bg-amber-500 text-amber-500' :
                                            list.name === 'IN REVIEW' ? 'bg-blue-500 text-blue-500' :
                                                list.name === 'BUG' ? 'bg-red-500 text-red-500' :
                                                    list.name === 'DONE' ? 'bg-green-500 text-green-500' :
                                                        ""}`} />
                                <h2 className="text-lg font-semibold">{list.name}</h2>
                            </div>
                            {list.name === 'TO DO' &&
                                <div className='flex items-center cursor-pointer'>
                                    <Plus className="w-6 h-6 rounded-sm border  text-green-500" />
                                </div>
                            }
                        </div>
                        <div className="space-y-4  max-h-[59vh] section overflow-x-auto">
                            {list.cards.map(card =>(
                            <div 
                            className={`bg-white p-4 rounded-md shadow cursor-pointer mr-1 card ${draggingCard && draggingCard.cardId === card._id ? 'dragging' : ''}`} key={list._id} 
                            draggable
                            onDragEnd={handleDragEnd}
                            onDragStart={(e) => handleDragStart(e, card._id, list._id)}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm  font-medium rounded-sm py-1 px-2 ${
                                        card.priority === 'high'? 'text-red-500 bg-red-200' :
                                        card.priority === 'medium'? 'text-orange-500 bg-orange-200' :
                                            'text-gray-500 bg-gray-200'}`}>{card.priority}</span>
                                    <Ellipsis className="w-6 h-6 text-gray-700" />
                                </div>
                                <h3 className="text-lg font-semibold pt-1">{card.title}</h3>
                                <p className="text-gray-500 text-sm">{card.description}</p>
                                <div className="flex items-center space-x-2 mt-4 text-sm text-gray-500">
                                    <div className="flex -space-x-2">
                                        <img src="https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg" alt="Avatar 1" className="h-7 w-7 rounded-full border-2 border-gray-100" />
                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGMvEQPKYQhv8HGhKYOzgvYTRcnWeHw_H0gg&s" alt="Avatar 4" className="h-7 w-7 rounded-full border-2 border-gray-100" />
                                        <div className="h-7 w-7 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-sm border-2 border-white">
                                            +2
                                        </div>
                                    </div>
                                    <span>12 comments</span>
                                    <span>0 files</span>
                                </div>
                            </div>
                            ))}

                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
