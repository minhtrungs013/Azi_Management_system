'use client';
import Modal from '@/components/Modal/Modal';
import TaskDetailModal from '@/components/task/taskDetailModal';
import { createNotification, refreshNotification, updateNotification } from '@/lib/store/features/notificationSlice';
import { getAllMemberProject } from '@/lib/store/features/projectSlice';
import { moveTask, setRefresh } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { checkRuleAccess } from '@/lib/utils';
import { members } from '@/types/auth';
import { notificationCreate } from '@/types/notification';
import { Cards, List, ProjectDetails } from '@/types/project';
import { Dot, Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useSocket } from "../../../contexts/SocketContext";
// import { socket } from '@/lib/socket';

interface Notification {
  // Define the shape of the notification object here
  // Example:
  id: string;
  message: string;
}
export default function ProjectTodo({ data }: { data: ProjectDetails | undefined }) {
  const [lists, setLists] = useState<List[]>(data?.lists || []);
  const [task, setTask] = useState<Cards>();
  const dispatch = useDispatch<AppDispatch>();
  const [draggingCard, setDraggingCard] = useState<{ cardId: string; sourceListId: string } | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [allMemberProject, setAllMemberProject] = useState<members[]>();
  const [ruleAccess, setRuleAccess] = useState<members>();
  const { socket, sendMessage } = useSocket();
  const [notification, setNotification] = useState<Notification[]>([]);
  const authState = useSelector((state: RootState) => state.auth);
  const userIds = allMemberProject?.map(item => item.user._id);

  useEffect(() => {

    if (socket) {
      socket.on("sendNotification", ({ group, message }) => {
        dispatch(setRefresh(true));
      });
    }
  }, [socket]);

  useEffect(() => {
    (async () => {
      if (data?._id) {
        const resAllMemberProject = await dispatch(getAllMemberProject(data?._id));
        if (getAllMemberProject.fulfilled.match(resAllMemberProject)) {
          setAllMemberProject(resAllMemberProject.payload);
          const user: members = resAllMemberProject.payload?.find((user: members) => user.user._id === authState.userId)
          setRuleAccess(user)
        }
      }
    })();
  }, [data])

  const openModal = (task: Cards) => {
    setTask(task);
    setModalOpen(true)
  };
  const closeModal = () => setModalOpen(false);
  useEffect(() => {
    setLists(data?.lists || []);
  }, [data])


  const handleDragStart = async (e: React.DragEvent, cardId: string, sourceListId: string, card: Cards) => {
    if (ruleAccess) {
      const hasPermission = await checkRuleAccess(['task_admin', 'project_admin'], ruleAccess)
      console.log(hasPermission);

      if (!hasPermission && authState.userId !== card.reporter?._id && authState.userId !== card.assignee?._id) {
        toast.warning('You have no permission to drag and drop this task.', {
          position: "bottom-left",
          autoClose: 5000,
        });
        return;
      }
    }

    e.dataTransfer.effectAllowed = 'move';

    setDraggingCard({ cardId, sourceListId });
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceListId', sourceListId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // e.currentTarget.classList.remove('dragging');
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
            cardToMove = list.tasks.find((card) => card._id === cardId) || null;
            return {
              ...list,
              tasks: list.tasks.filter((card) => card._id !== cardId),
            };
          }
          return list;
        });

        // Add the card to the new list
        if (cardToMove) {
          return updatedLists.map((list) => {
            if (list._id === targetListId) {
              dispatch(moveTask({ taskId: cardId, listId: targetListId }))
              const notification: notificationCreate = {
                title: 'Move Task',
                message: authState.name + ' has been moved ' + cardToMove?.title + ' to ' + list.name,
                type: 'Task',
                link: `/projects/${data?._id}/tasks/${cardToMove?.identifier}`,
                senderId: authState.userId || '',
                notificationRecipients: userIds || []
              }
              dispatch(createNotification(notification))
              // dispatch(refreshNotification(true));
              setTimeout(() => {
                sendMessage('sendNotification', { group: data?._id, message: authState.name + ' has been moved ' + cardToMove?.title + ' to ' + list.name });
              }, 1000);
              return {
                ...list,
                tasks: [...list.tasks, cardToMove!],
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
          <div className='rounded-xl bg-gray-100 dark:bg-[#131822] p-2' key={list._id}

            onDrop={(e) => handleDrop(e, list._id)}
            onDragOver={handleDragOver}

          >
            <div className={`flex justify-between items-center pb-4 pt-2 mb-4 border-b-2 
                            ${list.name === 'TO DO' ? ' border-gray-500' :
                list.name === 'IN PROGRESS' ? 'border-amber-500' :
                  list.name === 'REVIEW' ? 'border-blue-500' :
                    list.name === 'BUG' ? 'border-red-500' :
                      list.name === 'DONE' ? 'border-green-500' :
                        ""}`}>
              <div className='flex items-center'>
                <Dot className={`w-3 h-3 rounded-full mr-2
                                    ${list.name === 'TO DO' ? ' bg-gray-500 text-gray-500' :
                    list.name === 'IN PROGRESS' ? 'bg-amber-500 text-amber-500' :
                      list.name === 'REVIEW' ? 'bg-blue-500 text-blue-500' :
                        list.name === 'BUG' ? 'bg-red-500 text-red-500' :
                          list.name === 'DONE' ? 'bg-green-500 text-green-500' :
                            ""}`} />
                <h2 className="text-base font-medium">{list.name}</h2>
              </div>

            </div>
            <div className="space-y-4  min-h-[56vh] max-h-[56vh] section overflow-x-auto">
              {list.tasks.map(card => (
                <div onClick={() => openModal(card)}
                  className={`relative overflow-hidden bg-white dark:bg-[#020817] p-4 rounded-md shadow cursor-pointer mr-1 card ${draggingCard && draggingCard.cardId === card._id ? 'dragging' : ''}`} key={card._id}
                  draggable
                  onDragEnd={handleDragEnd}
                  onDragStart={(e) => handleDragStart(e, card._id, list._id, card)}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs  font-normal rounded-sm py-1 px-2 ${card.priority === 'high' ? 'text-red-500  bg-red-100' :
                      card.priority === 'medium' ? 'text-orange-500  bg-orange-100' :
                        'text-green-500  bg-green-100'}`}>{card.priority}</span>
                    <Ellipsis className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>

                    <h3 className="text-base font-semibold pt-1">{card.title}</h3>
                    {/* {card.image_urls.length > 0 ?
                    <div>
                      <img src={card.image_urls[0]} alt="Avatar 1" className="bg-white h-40 w-full rounded-md mr-2 cursor-pointer object-cover" />
                    </div>
                    :
                    <p className="text-gray-500 text-xs">{card.description}</p>
                  } */}
                    <p className="text-gray-500 text-xs line-clamp-2">{card.description}</p>
                    <div className="flex items-center  justify-between space-x-2 mt-4 text-sm text-gray-500">
                      <div className="flex -space-x-2">
                        <img src={card.assignee?.avatar_url} alt="Avatar 1" className="h-7 w-7 rounded-full border-2 border-gray-100" />
                      </div>
                      <div>
                        <span className='mr-2'>12 comments</span>
                        <span>0 files</span>
                      </div>
                    </div>
                    <div className={`absolute h-full  w-[5px] top-0 left-0 ${card.issueType == 'task' ? '  bg-blue-500 ' :
                      card.issueType == 'bug' ? ' bg-red-500' : 'bg-green-500'
                      }`}></div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        ))}

        <Modal isOpen={isModalOpen} closeModal={closeModal} >
          <TaskDetailModal closeModal={closeModal} task={task} allMemberProject={allMemberProject} projjectId={data?._id}/>
        </Modal>
      </div>
    </section>
  )
}
