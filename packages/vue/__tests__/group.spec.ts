import { mount } from '@vue/test-utils'
import { plugin } from '../src/plugin'
import defaultConfig from '../src/defaultConfig'
import { nextTick } from 'vue'
// import { jest } from '@jest/globals'

describe('group', () => {
  it('can pass values down to children', () => {
    const wrapper = mount(
      {
        template: `
        <div>
          <FormKit type="group" :value="{foo: 'abc', baz: 'hello'}">
            <FormKit name="foo" />
            <FormKit name="bar" />
            <FormKit name="baz" />
          </FormKit>
        </div>`,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    // TODO - Remove the .get() here when @vue/test-utils > rc.19
    const inputs = wrapper.get('div').findAll('input')
    expect(inputs[0].element.value).toBe('abc')
    expect(inputs[1].element.value).toBe('')
    expect(inputs[2].element.value).toBe('hello')
  })

  it('does not allow mutations to the initial value object. Issue #72', async () => {
    const wrapper = mount(
      {
        data() {
          return {
            initial: { foo: 'abc', baz: 'hello' },
          }
        },
        template: `
        <div>
          <FormKit type="group" :value="initial">
            <FormKit name="foo" :delay="0" />
            <FormKit name="bar" />
            <FormKit name="baz" />
          </FormKit>
        </div>`,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    wrapper.find('input').setValue('def')
    await new Promise((r) => setTimeout(r, 10))
    expect(wrapper.vm.initial).toStrictEqual({ foo: 'abc', baz: 'hello' })
  })

  it('can use v-model to change input values', async () => {
    const wrapper = mount(
      {
        data() {
          return {
            formData: {
              name: 'bob',
              address: {
                street: 'jane rd.',
                city: 'crypto city',
              },
            },
            street: 'jane rd.',
          }
        },
        template: `
      <div>
      <FormKit type="group" v-model="formData">
        <FormKit name="name" />
        <FormKit type="group" name="address">
          <FormKit name="street" v-model="street" />
          <FormKit name="city" />
        </FormKit>
      </FormKit>
      </div>
      `,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    // const consoleMock = jest.spyOn(console, 'warn').mockImplementation(() => {})
    // TODO - Remove the .get() here when @vue/test-utils > rc.19
    const inputs = wrapper.get('div').findAll('input')
    expect(inputs[0].element.value).toBe('bob')
    expect(inputs[1].element.value).toBe('jane rd.')
    expect(inputs[2].element.value).toBe('crypto city')
    inputs[1].setValue('foo rd.')
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.vm.$data.formData).toEqual({
      name: 'bob',
      address: {
        street: 'foo rd.',
        city: 'crypto city',
      },
    })
    expect(wrapper.vm.$data.street).toBe('foo rd.')
    // expect(consoleMock).toHaveBeenCalled()
    // consoleMock.mockRestore()
  })

  it('can reactively disable and enable all inputs in a group', async () => {
    const wrapper = mount(
      {
        data() {
          return {
            disabled: false,
          }
        },
        template: `<FormKit
          type="group"
          :disabled="disabled"
        >
          <FormKit id="disabledEmail" type="email" />
          <FormKit id="disabledSelect" type="select" />
        </FormKit>`,
      },
      {
        global: {
          plugins: [[plugin, defaultConfig]],
        },
      }
    )
    expect(wrapper.find('[data-disabled] input[disabled]').exists()).toBe(false)
    expect(wrapper.find('[data-disabled] select[disabled]').exists()).toBe(
      false
    )
    wrapper.setData({ disabled: true })
    await nextTick()
    expect(wrapper.find('[data-disabled] input[disabled]').exists()).toBe(true)
    expect(wrapper.find('[data-disabled] select[disabled]').exists()).toBe(true)
  })
})
