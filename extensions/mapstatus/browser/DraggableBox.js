import React from "react";

class DraggableBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dragInfo: {
                x: 100,
                y: 100,
                offsetX: 0,
                offsetY: 0
            },
            isDragging: false
        };
        this.boxRef = React.createRef();
    }

    componentDidMount() {

    }


    handleMouseDown = (e) => {
        const rect = this.boxRef.current.getBoundingClientRect();
        this.setState({
            isDragging: true,
            dragInfo: {
                ...this.state.dragInfo,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                x: rect.left,
                y: rect.top
            }

        });
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    handleMouseUp = () => {
        this.setState({ isDragging: false });
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    handleMouseMove = (e) => {
        if (!this.state.isDragging) return;

        if (e.clientX < 0 || e.clientY < 40) return;
        if (e.clientX > window.innerWidth || e.clientY > window.innerHeight) return;

        this.setState({
            dragInfo: {
                ...this.state.dragInfo,
                x: e.clientX - this.state.dragInfo.offsetX,
                y: e.clientY - this.state.dragInfo.offsetY
            }
        });
        if (this.boxRef.current) {
            this.boxRef.current.style.position = 'absolute';
            this.boxRef.current.style.left = `${this.state.dragInfo.x}px`;
            this.boxRef.current.style.top = `${this.state.dragInfo.y}px`;
            this.boxRef.current.style.cursor = 'move';
        }
    }

    render() {
        const { children, style, headerText } = this.props;

        return (
            <div onMouseDown={this.handleMouseDown}
                style={{ ...style }}
                ref={this.boxRef}
            >
                <div>
                    <h5>{headerText}</h5>
                    <div >
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

export default DraggableBox;
