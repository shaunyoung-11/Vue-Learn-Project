<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @input="getUserList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[a-a-zA-z0-9_-])+/
      if (regEmail.test(value)) return cb()

      cb(new Error('请输入合法的邮箱'))
    }

    //验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57]|19[0-9])[0-9]{8}$/
      if (regMobile.test(value)) return cb()

      cb(new Error('请输入合法的手机号'))
    }

    return {
      //获取用户列表的参数
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      //添加用户对话框显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度不合法', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //修改用户对话框显示与隐藏
      editDialogVisible: false,
      //查询到用户信息
      editForm: {},
      //修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      this.$http.get('users', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status != 200)
          return this.$message.error('获取用户列表失败！')
        this.userList = res.data.data.users
        this.total = res.data.data.total
        console.log(res.data)
      })
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听switch开关状态
    userStateChange(userInfo) {
      console.log(userInfo)
      this.$http
        .put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        .then(res => {
          console.log(res)
          if (res.data.meta.status != 200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败！')
          }
          this.$message.success('更新用户状态成功')
        })
    },
    //监听添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    //点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(valid => {
        console.log(valid)
        if (!valid) {
          this.$message.error('表单数据不完整')
        }
        //发起网络请求
        this.$http.post('users', this.addForm).then(res => {
          if (res.data.meta.status != 201)
            return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.getUserList()
          this.addDialogClosed()
        })
      })
    },
    //展示编辑用户的对话框
    showEditDialog(id) {
      this.$http.get(`users/${id}`).then(res => {
        if (res.data.meta.status != 200)
          return this.$message.error('查询用户信息失败！')
        this.editForm = res.data.data
        this.editDialogVisible = true
      })
    },
    //关闭修改用户表单重置验证结果
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //编辑用户提交预验证
    editUserInfo() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return this.$message.error('表单信息不正确！')
        this.$http
          .put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          .then(res => {
            if (res.data.meta.status != 200)
              return this.$message.error('更新用户信息失败！')

            //关闭对话框
            this.editDialogVisible = false
            //刷新数据列表
            this.getUserList()
            //提示修改成功
            this.$message.success('更新用户信息成功')
          })
      })
    },
    //根据Id删除对应用户信息
    removeUserById(id) {
      // 弹框询问是否删除
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          this.$http.delete('users/' + id).then(res => {
            if (res.data.meta.status != 200)
              return this.$message.error('删除用户失败！')
            this.$message.success('删除成功')
            this.getUserList()
          })
        })
        .catch(err => {
          this.$message.info('已经取消删除')
        })
    }
  }
}
</script>

<style scoped></style>
