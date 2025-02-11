import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

@customElement('filter-variables-helper')
export class FilterVariablesHelper extends LitElement {
  static styles = css`
    .err-msg {
      color: red;
    }
  `;

  @property({ type: Array })
  list: {
    name: string;
    test: boolean | number | string;
    hidden?: boolean;
  }[] = [];

  @state()
  private errMsg = '';

  @query('#name-input')
  name!: HTMLInputElement;

  @query('#test-input')
  test!: HTMLInputElement;

  onChanged() {
    const filter = this.list.map(({ name, test }) => ({ name, test }));

    const detail = { filter };
    const event = new CustomEvent('filter-changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  addItem() {
    this.errMsg = '';

    const { name } = this;
    if (!name.value) {
      this.errMsg = 'Name is required';
      return;
    }

    const { test } = this;
    if (!test.value) {
      this.errMsg = 'Test is required';
      return;
    }

    // 变量名不能重复
    if (this.list.find(item => item.name === name.value)) {
      this.errMsg = 'Name is duplicated';
      return;
    }

    let { value }: any = test;
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!Number.isNaN(Number(value))) {
      value = Number(value);
    }

    this.list.push({ name: name.value, test: value });
    this.requestUpdate();

    this.onChanged();
  }

  deleteItem(index: number) {
    return () => {
      this.list.splice(index, 1);
      this.requestUpdate();

      this.onChanged();
    };
  }

  render() {
    return html`
      <div>
        <input id="name-input" placeholder="Input a variable name" />
        <input id="test-input" placeholder="Input a test value" />
        <button @click=${this.addItem}>Add</button>
        <div class="err-msg">${this.errMsg}</div>
      </div>

      <ul>
        ${map(
          this.list,
          (item, index) => html`
            <li>
              <label>
                ${item.name} = ${item.test}
                <button @click=${this.deleteItem(index)}>Delete</button>
              </label>
            </li>
          `
        )}
      </ul>
    `;
  }
}
