import { useEffect } from 'react';
import { useUserStore } from '../store';
import './UserList.css';

export const UserList = () => {
  const { users, loading, error, fetchUsers, removeUser, clearUsers } = useUserStore();

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, []);

  return (
    <div className="user-list-container">
      <h2>用户列表示例</h2>
      
      <div className="user-list-actions">
        <button onClick={fetchUsers} disabled={loading} className="btn btn-primary">
          {loading ? '加载中...' : '刷新用户'}
        </button>
        <button onClick={clearUsers} className="btn btn-danger">
          清空列表
        </button>
      </div>

      {error && (
        <div className="error-message">
          错误: {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="user-grid">
          {users.length === 0 ? (
            <div className="empty-state">
              <p>暂无用户数据</p>
              <button onClick={fetchUsers} className="btn btn-primary">
                加载用户
              </button>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
                <button
                  onClick={() => removeUser(user.id)}
                  className="btn-remove"
                  aria-label="删除用户"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
