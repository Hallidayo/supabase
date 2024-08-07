import { PermissionAction } from '@supabase/shared-types/out/constants'
import { useParams } from 'common'
import toast from 'react-hot-toast'

import { useUserCreateMutation } from 'data/auth/user-create-mutation'
import { useProjectApiQuery } from 'data/config/project-api-query'
import { useCheckPermissions } from 'hooks/misc/useCheckPermissions'
import { Button, Checkbox, Form, IconLock, IconMail, Input, Loading, Modal } from 'ui'

export type CreateUserModalProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const CreateUserModal = ({ visible, setVisible }: CreateUserModalProps) => {
  const { ref: projectRef } = useParams()

  const { data, isLoading, isSuccess } = useProjectApiQuery({ projectRef }, { enabled: visible })

  const handleToggle = () => setVisible(!visible)
  const canCreateUsers = useCheckPermissions(PermissionAction.AUTH_EXECUTE, 'create_user')

  const validate = (values: any) => {
    const errors: any = {}
    const emailValidateRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (values.email.length === 0) {
      errors.email = 'Please enter a valid email'
    } else if (!emailValidateRegex.test(values.email)) {
      errors.email = `${values.email} is an invalid email`
    }

    if (!values.password?.trim()) {
      errors.password = 'Please enter a password'
    }

    return errors
  }

  const { mutate: createUser, isLoading: isCreatingUser } = useUserCreateMutation({
    async onSuccess(res) {
      toast.success(`Successfully created user: ${res.email}`)
      setVisible(false)
    },
  })

  const onCreateUser = async (values: any) => {
    if (!isSuccess) {
      return toast.error(`Failed to create user: Error loading project config`)
    }
    const { protocol, endpoint, serviceApiKey } = data.autoApiService
    createUser({ projectRef, endpoint, protocol, serviceApiKey, user: values })
  }

  return (
    <Modal
      hideFooter
      size="small"
      key="create-user-modal"
      visible={visible}
      header="Create a new user"
      onCancel={handleToggle}
      loading={true}
    >
      <Form
        validateOnBlur={false}
        initialValues={{ email: '', password: '', autoConfirmUser: true }}
        validate={validate}
        onSubmit={onCreateUser}
      >
        {() => (
          <Loading active={isLoading}>
            <Modal.Content className="space-y-4">
              <Input
                id="email"
                autoComplete="off"
                label="User Email"
                icon={<IconMail />}
                type="email"
                name="email"
                placeholder="user@example.com"
                disabled={isCreatingUser || isLoading}
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="User Password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                icon={<IconLock />}
                disabled={isCreatingUser || isLoading}
                autoComplete="new-password"
              />

              <Checkbox
                value="true"
                id="autoConfirmUser"
                name="autoConfirmUser"
                label="Auto Confirm User?"
                size="medium"
                disabled={isCreatingUser || isLoading}
              />
              <p className="text-sm text-foreground-lighter">
                A confirmation email will not be sent when creating a user via this form.
              </p>
            </Modal.Content>
            <Modal.Separator />
            <Modal.Content>
              <Button
                block
                size="small"
                htmlType="submit"
                loading={isCreatingUser}
                disabled={!canCreateUsers || isCreatingUser || isLoading}
              >
                Create user
              </Button>
            </Modal.Content>
          </Loading>
        )}
      </Form>
    </Modal>
  )
}

export default CreateUserModal
