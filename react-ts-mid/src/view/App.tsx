import { useEffect, useRef, useState } from 'react'
import '../style/App.css'
import { asyncGet, asyncPost, asyncDelete, asyncPut } from '../utils/fetch'
import { api } from '../enum/api'
import { Student } from '../interface/Student'
import { resp } from '../interface/resp'

function App() {
  const [students, setStudents] = useState<Array<Student>>([])

  // 控制不同模态框的状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // 更新和删除时选中的学生
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // 新增和更新表单状态
  const [studentForm, setStudentForm] = useState<Student>({
    帳號: '',
    座號: 0,
    姓名: '',
    院系: '',
    年級: '',
    班級: '',
    Email: ''
  })

  const cache = useRef<boolean>(false)

  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsSearchModalOpen(false);
    setIsUpdateModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    if (!cache.current) {
      cache.current = true;
      fetchStudents();
    }
  }, [])

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      console.log('開始獲取學生列表');
      const res: resp<Array<Student>> = await asyncGet(api.findAll);
      console.log('獲取到的回應:', res);

      if (res.code == 200) {
        console.log('設置學生數據:', res.body);
        setStudents(res.body);
      } else {
        console.log('回應碼不是 200:', res.code);
      }
    } catch (error) {
      console.error('获取学生列表失败', error);
    }
  }

  const handleCreate = async () => {
    try {
      // 首先檢查要發送的數據
      console.log('準備發送的資料:', studentForm);

      const response = await asyncPost(api.insertOne, studentForm);
      console.log('收到的回應:', response);

      if (response && response.code === 200) {
        console.log('新增成功，新學生資料:', response.body);
        await fetchStudents(); // 重新獲取所有學生數據
        setIsCreateModalOpen(false);
        // 重置表單
        setStudentForm({
          帳號: '',
          座號: 0,
          姓名: '',
          院系: '',
          年級: '',
          班級: '',
          Email: ''
        });
      } else {
        console.error('新增失敗:', response);
      }
    } catch (error) {
      console.error('新增學生時發生錯誤:', error);
    }
  }

  const [searchField, setSearchField] = useState<keyof Student>('姓名');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSearch = async () => {
    try {
      console.log('搜尋條件:', searchField, searchValue);
      if (!searchValue.trim()) {
        // 如果搜尋值為空，獲取所有資料
        await fetchStudents();
      } else {
        const response = await asyncGet(`${api.getByField}/${searchField}/${searchValue}`);
        console.log('搜尋結果:', response);

        // 檢查 response.body 是否為 null 或空陣列
        if (response.code === 404 || !response.body || (Array.isArray(response.body) && response.body.length === 0)) {
          console.log('查無資料');
          setStudents([]);  // 確保設置空陣列
        } else {
          // 如果有資料，確保轉換成陣列
          const studentArray = Array.isArray(response.body) ? response.body : [response.body];
          setStudents(studentArray);
        }
        setIsSearchModalOpen(false);
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
      setStudents([]); // 錯誤時也設置空陣列
    }
  };

  // 更新学生
  const handleUpdate = async () => {
    if (!selectedStudent?._id) return;

    try {
      console.log('正在更新學生:', selectedStudent._id);
      console.log('更新的數據:', studentForm);

      const response = await asyncPut(`${api.updateById}/${selectedStudent._id}`, studentForm);
      console.log('更新響應:', response);

      if (response && response.code === 200) {
        // 更新本地状态
        setStudents(students.map(student =>
          student._id === selectedStudent._id ? response.body : student
        ));
        setIsUpdateModalOpen(false);
        // 重置表單和選中的學生
        setStudentForm({
          帳號: '',
          座號: 0,
          姓名: '',
          院系: '',
          年級: '',
          班級: '',
          Email: ''
        });
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('更新學生失敗:', error);
    }
  }

  // 删除学生
  const handleDelete = async () => {
    if (!selectedStudent?._id) return;

    try {
      const response = await asyncDelete(`${api.deleteById}/${selectedStudent._id}`);
      if (response.code === 200) {
        // 更新本地狀態
        setStudents(students.filter(student => student._id !== selectedStudent._id));
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('刪除學生失敗', error);
    }
  }

  const studentList = (students && students.length > 0) ? students.map((student: Student) => {
    return (
      <div
        className='student'
        key={student._id}
        onClick={() => {
          setSelectedStudent(student);
          setStudentForm(student);
        }}
      >
        <p>帳號: {student.帳號}</p>
        <p>座號: {student.座號}</p>
        <p>姓名: {student.姓名}</p>
        <p>院系: {student.院系}</p>
        <p>年級: {student.年級}</p>
        <p>班級: {student.班級}</p>
        <p>Email: {student.Email}</p>
      </div>
    )
  }) : (
    <div className="no-data" style={{
      textAlign: 'center',
      padding: '20px',
      fontSize: '18px'
    }}>
      查無資料
    </div>
  );

  return (
    <>
      <div className="button-group">
        <button onClick={() => {
          closeAllModals();
          setIsCreateModalOpen(true);
        }}>新增資料</button>
        <button onClick={fetchStudents}>查詢全部資料</button>
        <button onClick={() => {
          closeAllModals();
          setIsSearchModalOpen(true);
        }}>條件查詢</button>
        <button onClick={() => {
          if (!selectedStudent) {
            alert('請先選擇要更新的資料');
            return;
          }
          closeAllModals();
          setIsUpdateModalOpen(true);
        }}>更新資料</button>
        <button onClick={() => {
          if (!selectedStudent) {
            alert('請先選擇要刪除的資料');
            return;
          }
          closeAllModals();
          setIsDeleteModalOpen(true);
        }}>刪除資料</button>
      </div>

      {isCreateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>新增學生資料</h2>
            <input
              placeholder="帳號"
              value={studentForm.帳號}
              onChange={(e) => setStudentForm(prev => ({
                ...prev,
                帳號: e.target.value
              }))}
            />
            <input
              placeholder="姓名"
              value={studentForm.姓名}
              onChange={(e) => setStudentForm({ ...studentForm, 姓名: e.target.value })}
            />
            <input
              placeholder="院系"
              value={studentForm.院系}
              onChange={(e) => setStudentForm({ ...studentForm, 院系: e.target.value })}
            />
            <input
              placeholder="年級"
              value={studentForm.年級}
              onChange={(e) => setStudentForm({ ...studentForm, 年級: e.target.value })}
            />
            <input
              placeholder="班級"
              value={studentForm.班級}
              onChange={(e) => setStudentForm({ ...studentForm, 班級: e.target.value })}
            />
            <input
              placeholder="Email"
              value={studentForm.Email}
              onChange={(e) => setStudentForm({ ...studentForm, Email: e.target.value })}
            />
            <button onClick={handleCreate}>確認新增</button>
            <button onClick={() => {
              closeAllModals();
              setStudentForm({
                帳號: '',
                座號: 0,
                姓名: '',
                院系: '',
                年級: '',
                班級: '',
                Email: ''
              });
            }}>取消</button>
          </div>
        </div>
      )}

      {isSearchModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>搜尋學生資料</h2>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as keyof Student)}
            >
              <option value="帳號">帳號</option>
              <option value="座號">座號</option>
              <option value="姓名">姓名</option>
              <option value="院系">院系</option>
              <option value="年級">年級</option>
              <option value="班級">班級</option>
              <option value="Email">Email</option>
            </select>
            <input
              placeholder={`請輸入${searchField}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              type={searchField === '座號' ? 'number' : 'text'}
            />
            <button onClick={handleSearch}>確認搜尋</button>
            <button onClick={() => {
              closeAllModals();
              setSearchValue('');
            }}>取消</button>
          </div>
        </div>
      )}

      {/* 更新模态框 */}
      {isUpdateModalOpen && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h2>更新學生資料</h2>
            <input
              placeholder="帳號"
              value={studentForm.帳號}
              onChange={(e) => setStudentForm(prev => ({
                ...prev,
                帳號: e.target.value
              }))}
            />
            <input
              placeholder="座號"
              type="number"
              value={studentForm.座號}
              onChange={(e) => setStudentForm({ ...studentForm, 座號: Number(e.target.value) })}
            />
            <input
              placeholder="姓名"
              value={studentForm.姓名}
              onChange={(e) => setStudentForm({ ...studentForm, 姓名: e.target.value })}
            />
            <input
              placeholder="院系"
              value={studentForm.院系}
              onChange={(e) => setStudentForm({ ...studentForm, 院系: e.target.value })}
            />
            <input
              placeholder="年級"
              value={studentForm.年級}
              onChange={(e) => setStudentForm({ ...studentForm, 年級: e.target.value })}
            />
            <input
              placeholder="班級"
              value={studentForm.班級}
              onChange={(e) => setStudentForm({ ...studentForm, 班級: e.target.value })}
            />
            <input
              placeholder="Email"
              value={studentForm.Email}
              onChange={(e) => setStudentForm({ ...studentForm, Email: e.target.value })}
            />
            <button onClick={handleUpdate}>確認更新</button>
            <button onClick={closeAllModals}>取消</button>
          </div>
        </div>
      )}

      {/* 刪除模态框 */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h2>確認刪除學生</h2>
            <p>是否刪除以下學生?</p>
            <p>姓名: {selectedStudent.姓名}</p>
            <p>帳號: {selectedStudent.帳號}</p>
            <button onClick={handleDelete}>確認刪除</button>
            <button onClick={closeAllModals}>取消</button>
          </div>
        </div>
      )}

      <div className="container">
        {studentList}
      </div>
    </>
  )
}

export default App